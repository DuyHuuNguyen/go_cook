import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { paymentApi } from "../../clients/PaymentClient";
import { PaymentResultResponse, PaymentStatus, VnpayVerifyResponse } from "../../types/PaymentTypes";

// ─── helpers ─────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

/** Normalize VnpayVerifyResponse hoặc PaymentResultResponse thành shape chung */
type DisplayResult = {
  status: PaymentStatus;
  bookingId?: number | null;
  amount?: number;
  transactionId?: string;
  paidAt?: string;
  message?: string;
};

function toDisplayResult(r: VnpayVerifyResponse | PaymentResultResponse): DisplayResult {
  return {
    status: r.status,
    bookingId: (r as PaymentResultResponse).bookingId ?? (r as VnpayVerifyResponse).bookingId,
    amount: r.amount,
    transactionId: r.transactionId ?? (r as VnpayVerifyResponse).transactionId,
    paidAt: r.paidAt,
    message: r.message,
  };
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  PaymentStatus,
  {
    icon: string;
    iconBg: string;
    iconColor: string;
    title: string;
    desc: string;
    badgeText: string;
    badgeBg: string;
    badgeColor: string;
  }
> = {
  SUCCESS: {
    icon: "✓",
    iconBg: "#dcfce7",
    iconColor: "#15803d",
    title: "Thanh toán thành công!",
    desc: "Đơn đặt bếp của bạn đã được xác nhận. Chúng tôi sẽ liên hệ để xác nhận chi tiết.",
    badgeText: "Thanh toán thành công",
    badgeBg: "#dcfce7",
    badgeColor: "#15803d",
  },
  PENDING: {
    icon: "⏳",
    iconBg: "#fef9c3",
    iconColor: "#a16207",
    title: "Đang xử lý thanh toán",
    desc: "Giao dịch của bạn đang được xử lý. Vui lòng đợi trong giây lát và không thực hiện lại thanh toán.",
    badgeText: "Đang xử lý",
    badgeBg: "#fef9c3",
    badgeColor: "#a16207",
  },
  FAILED: {
    icon: "✕",
    iconBg: "#fee2e2",
    iconColor: "#dc2626",
    title: "Thanh toán thất bại",
    desc: "Giao dịch không thành công. Vui lòng kiểm tra lại thông tin hoặc thử phương thức thanh toán khác.",
    badgeText: "Thanh toán thất bại",
    badgeBg: "#fee2e2",
    badgeColor: "#dc2626",
  },
  EXPIRED: {
    icon: "⌛",
    iconBg: "#f3f4f6",
    iconColor: "#6b7280",
    title: "Phiên thanh toán hết hạn",
    desc: "Phiên thanh toán đã hết hạn. Vui lòng quay lại trang đặt lịch và thử lại.",
    badgeText: "Hết hạn",
    badgeBg: "#f3f4f6",
    badgeColor: "#6b7280",
  },
};

// ─── Spinner ─────────────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="pr-loading" role="status">
      <div className="pr-loading__spinner" aria-hidden="true" />
      <p>Đang xác nhận kết quả thanh toán...</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();

  // Flow 1: redirect từ backend sau khi verify  → ?bookingId=xxx
  const bookingId = searchParams.get("bookingId");

  // Flow 2: VNPay redirect thẳng về frontend   → ?vnp_TxnRef=xxx&vnp_ResponseCode=00&...
  const vnpTxnRef = searchParams.get("vnp_TxnRef");
  const isVnpayCallback = !!vnpTxnRef;

  const [result, setResult] = useState<DisplayResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    if (isVnpayCallback) {
      // Collect tất cả vnp_* params và forward về backend để verify
      const vnpParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        vnpParams[key] = value;
      });

      paymentApi
        .verifyVnpayReturn(vnpParams)
        .then((data) => {
          if (!cancelled) setResult(toDisplayResult(data));
        })
        .catch(() => {
          if (!cancelled)
            setFetchError("Không thể xác nhận kết quả thanh toán. Vui lòng liên hệ hỗ trợ.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

    } else if (bookingId) {
      paymentApi
        .getPaymentResult(bookingId)
        .then((data) => {
          if (!cancelled) setResult(toDisplayResult(data));
        })
        .catch(() => {
          if (!cancelled)
            setFetchError("Không thể xác nhận kết quả thanh toán. Vui lòng liên hệ hỗ trợ.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });

    } else {
      setFetchError("Không tìm thấy thông tin đơn đặt lịch.");
      setLoading(false);
    }

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);  // chỉ chạy 1 lần khi mount — params lấy từ closure đầu tiên

  const status = (result?.status ?? "PENDING") as PaymentStatus;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.PENDING;
  const displayBookingId = result?.bookingId ?? bookingId;

  return (
    <>
      <style>{CSS}</style>

      <main className="pr-page">

        <div className="pr-container">
          {loading && <LoadingState />}

          {!loading && fetchError && (
            <div className="pr-card pr-error-state" role="alert">
              <span className="pr-error-icon">⚠️</span>
              <h2>Không thể xác nhận</h2>
              <p>{fetchError}</p>
              <div className="pr-actions">
                <Link to="/" className="pr-btn pr-btn--outline">
                  Về trang chủ
                </Link>
              </div>
            </div>
          )}

          {!loading && !fetchError && result && (
            <section className="pr-card pr-result-card" aria-live="polite">
              {/* Icon */}
              <div
                className="pr-icon-box"
                style={{ background: cfg.iconBg, color: cfg.iconColor }}
                aria-hidden="true"
              >
                {cfg.icon}
              </div>

              {/* Badge */}
              <span
                className="pr-badge"
                style={{ background: cfg.badgeBg, color: cfg.badgeColor }}
              >
                {cfg.badgeText}
              </span>

              {/* Title & description */}
              <h1 className="pr-title">{cfg.title}</h1>
              <p className="pr-desc">{result.message ?? cfg.desc}</p>

              {/* Detail info */}
              <div className="pr-detail-box">
                {displayBookingId && (
                  <div className="pr-detail-row">
                    <span>Mã đặt lịch</span>
                    <strong>#{displayBookingId}</strong>
                  </div>
                )}
                {result.transactionId && (
                  <div className="pr-detail-row">
                    <span>Mã giao dịch</span>
                    <strong>{result.transactionId}</strong>
                  </div>
                )}
                {result.amount !== undefined && result.amount > 0 && (
                  <div className="pr-detail-row">
                    <span>Số tiền</span>
                    <strong className="pr-amount">{formatCurrency(result.amount)}</strong>
                  </div>
                )}
                {result.paidAt && (
                  <div className="pr-detail-row">
                    <span>Thời gian</span>
                    <strong>{formatDateTime(result.paidAt)}</strong>
                  </div>
                )}
              </div>

              {/* CTA buttons */}
              <div className="pr-actions">
                {status === "SUCCESS" && (
                  <>
                    <Link to="/" className="pr-btn pr-btn--primary">
                      Về trang chủ
                    </Link>
                    <Link to="/profile" className="pr-btn pr-btn--outline">
                      Xem lịch sử đơn đặt
                    </Link>
                  </>
                )}

                {status === "PENDING" && (
                  <>
                    <button
                      className="pr-btn pr-btn--primary"
                      onClick={() => window.location.reload()}
                    >
                      Kiểm tra lại
                    </button>
                    <Link to="/" className="pr-btn pr-btn--outline">
                      Về trang chủ
                    </Link>
                  </>
                )}

                {(status === "FAILED" || status === "EXPIRED") && (
                  <>
                    {displayBookingId && (
                      <Link
                        to={`/bookings/${displayBookingId}/checkout`}
                        className="pr-btn pr-btn--primary"
                      >
                        Thử thanh toán lại
                      </Link>
                    )}
                    <Link to="/" className="pr-btn pr-btn--outline">
                      Về trang chủ
                    </Link>
                  </>
                )}
              </div>

              {/* Help note */}
              <p className="pr-help">
                Cần hỗ trợ? Liên hệ{" "}
                <a href="mailto:support@gocook.vn" className="pr-link">
                  support@gocook.vn
                </a>
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}

// ─── Scoped CSS ───────────────────────────────────────────────────────────────

const CSS = `
@keyframes pr-spin {
  to { transform: rotate(360deg); }
}

.pr-page {
  font-family: "Inter", system-ui, sans-serif;
  background: #f8f7f2;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.5;
  min-height: 100vh;
  padding-bottom: 60px;
}

/* ── Container ── */
.pr-container {
  max-width: 560px;
  margin: 60px auto;
  padding: 0 16px;
}

/* ── Card ── */
.pr-card {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 4px 20px rgba(0,0,0,.07);
  padding: 40px 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

/* ── Icon ── */
.pr-icon-box {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 700;
}

/* ── Badge ── */
.pr-badge {
  padding: 5px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: .3px;
}

/* ── Title ── */
.pr-title { font-size: 24px; font-weight: 700; margin: 0; color: #111827; }
.pr-desc { color: #4b5563; margin: 0; max-width: 420px; }

/* ── Detail box ── */
.pr-detail-box {
  width: 100%;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  text-align: left;
}
.pr-detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #374151;
}
.pr-detail-row span { color: #6b7280; }
.pr-amount { color: #297a38; font-size: 16px; }

/* ── Actions ── */
.pr-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

/* ── Buttons ── */
.pr-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  text-decoration: none;
  transition: opacity .15s, transform .1s;
  flex: 1;
  min-width: 140px;
}
.pr-btn:hover { opacity: .88; }
.pr-btn:active { transform: scale(.97); }
.pr-btn--primary { background: #297a38; color: #fff; }
.pr-btn--outline {
  background: #fff;
  color: #374151;
  border: 1.5px solid #d1d5db;
}

/* ── Help ── */
.pr-help { font-size: 13px; color: #9ca3af; margin: 0; }
.pr-link { color: #297a38; text-decoration: none; }
.pr-link:hover { text-decoration: underline; }

/* ── Error state ── */
.pr-error-state { }
.pr-error-icon { font-size: 48px; }
.pr-error-state h2 { font-size: 20px; font-weight: 700; margin: 0; }
.pr-error-state p { color: #6b7280; margin: 0; }

/* ── Loading ── */
.pr-loading {
  text-align: center;
  padding: 80px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.pr-loading__spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #297a38;
  border-radius: 50%;
  animation: pr-spin .8s linear infinite;
}
.pr-loading p { color: #6b7280; font-size: 15px; }
`;
