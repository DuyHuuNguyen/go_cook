import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import axios from "axios";
import { paymentApi } from "../../clients/PaymentClient";
import { BookingDetailResponse } from "../../types/PaymentTypes";
import { useApp } from "../../contexts/AppContext";

// ─── helpers ────────────────────────────────────────────────────────────────

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

function formatTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function SkeletonBlock({ height = 20, width = "100%" }: { height?: number | string; width?: string | number }) {
  return (
    <div
      style={{
        height,
        width,
        background: "linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)",
        backgroundSize: "200% 100%",
        borderRadius: 6,
        animation: "co-skeleton-shimmer 1.4s infinite",
      }}
    />
  );
}

// ─── Dish avatar with fallback ────────────────────────────────────────────────

function DishAvatar({ src, name }: { src?: string; name: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    return (
      <div className="co-dish-avatar co-dish-avatar--fallback" aria-hidden="true">
        🍽
      </div>
    );
  }
  return (
    <img
      className="co-dish-avatar"
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setErr(true)}
    />
  );
}

// ─── Chef avatar ──────────────────────────────────────────────────────────────

function ChefAvatar({ src, name }: { src?: string | null; name: string }) {
  const [err, setErr] = useState(false);
  if (!src || err) {
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .slice(-2)
      .join("")
      .toUpperCase();
    return (
      <div className="co-chef-avatar co-chef-avatar--fallback" aria-label={name}>
        {initials}
      </div>
    );
  }
  return (
    <img
      className="co-chef-avatar"
      src={src}
      alt={name}
      onError={() => setErr(true)}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CheckoutPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { notify } = useApp();

  const [booking, setBooking] = useState<BookingDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [paying, setPaying] = useState(false);

  // Fetch booking detail
  useEffect(() => {
    if (!bookingId) return;
    let cancelled = false;
    setLoading(true);
    setError("");

    paymentApi
      .getBookingDetail(bookingId)
      .then((data) => {
        if (!cancelled) setBooking(data);
      })
      .catch(() => {
        if (!cancelled) setError("Không thể tải thông tin đặt lịch. Vui lòng thử lại.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  // Handle payment button
  async function handlePayment() {
    if (!bookingId || !agreed || paying) return;

    try {
      setPaying(true);
      const result = await paymentApi.createVnpayPayment({ bookingId: Number(bookingId) });

      if (result.paymentUrl) {
        // Redirect to VNPay gateway – do NOT process payment on frontend
        window.location.href = result.paymentUrl;
      } else {
        notify("Không nhận được đường dẫn thanh toán. Vui lòng thử lại.", {
          variant: "danger",
          title: "Lỗi thanh toán",
          delay: 5000,
        });
      }
    } catch (err) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message as string | undefined)
        : undefined;

      notify(
        typeof message === "string"
          ? message
          : "Khởi tạo thanh toán thất bại. Vui lòng thử lại.",
        { variant: "danger", title: "Lỗi thanh toán", delay: 5000 }
      );
    } finally {
      setPaying(false);
    }
  }

  return (
    <>
      <style>{CSS}</style>

      <main id="co-main" className="co-page">

        <div className="co-container">
          {/* Breadcrumb */}
          <nav className="co-breadcrumb" aria-label="Đường dẫn">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Xác nhận lịch nấu</span>
          </nav>

          <div className="co-page-heading">
            <h1>Xác nhận lịch nấu</h1>
            <p className="co-lead">Một bước nữa để bữa cơm nhà được chuẩn bị chu đáo.</p>
          </div>

          {/* Error state */}
          {!loading && error && (
            <div className="co-error-state" role="alert">
              <span className="co-error-state__icon">⚠️</span>
              <p>{error}</p>
              <button
                className="co-btn co-btn--primary"
                onClick={() => window.location.reload()}
              >
                Thử lại
              </button>
            </div>
          )}

          {/* Main layout */}
          {!error && (
            <div className="co-split">
              {/* ── Left column ── */}
              <div className="co-stack">
                {/* Menu & dishes */}
                <section className="co-card co-stack">
                  <div className="co-menu-header">
                    {loading ? (
                      <SkeletonBlock height={24} width="60%" />
                    ) : (
                      <h3>{booking?.menuName ?? "Thực đơn đặt theo yêu cầu"}</h3>
                    )}
                  </div>

                  <div className="co-dish-list">
                    {loading
                      ? [0, 1, 2].map((i) => (
                        <div key={i} className="co-order-item">
                          <div className="co-dish-avatar co-dish-avatar--skeleton" />
                          <div className="co-stack" style={{ gap: 6, flex: 1 }}>
                            <SkeletonBlock height={16} width="55%" />
                            <SkeletonBlock height={12} width="35%" />
                          </div>
                        </div>
                      ))
                      : (booking?.dishes || []).map((dish) => (
                        <div key={dish.dishId} className="co-order-item">
                          <DishAvatar src={dish.imageUrl} name={dish.dishName} />
                          <div>
                            <h4 className="co-dish-name">
                              {dish.dishName}
                              {dish.quantity > 1 && (
                                <span className="co-dish-qty">×{dish.quantity}</span>
                              )}
                            </h4>
                            {dish.category && (
                              <p className="co-small co-muted">{dish.category}</p>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                {/* Chef info */}
                <section className="co-card co-stack">
                  <h3>Thông tin đầu bếp</h3>
                  {loading ? (
                    <div className="co-order-item" style={{ alignItems: "center" }}>
                      <div className="co-chef-avatar co-chef-avatar--skeleton" />
                      <div className="co-stack" style={{ gap: 8, flex: 1 }}>
                        <SkeletonBlock height={18} width="40%" />
                        <SkeletonBlock height={13} width="60%" />
                      </div>
                    </div>
                  ) : booking?.chefId ? (
                    <div className="co-order-item" style={{ alignItems: "center" }}>
                      <ChefAvatar
                        src={booking.chefAvatar}
                        name={booking.chefName ?? "Đầu bếp"}
                      />
                      <div>
                        <h4 className="co-chef-name">{booking.chefName ?? "Đầu bếp"}</h4>
                        <p className="co-small co-status-accepted">
                          Đầu bếp đã chấp nhận yêu cầu
                        </p>
                        <p className="co-small co-status-confirmed">
                          <svg
                            width={14}
                            height={14}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          </svg>
                          Đã xác nhận giá
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="co-muted co-small">Chưa có đầu bếp được phân công.</p>
                  )}
                </section>

                {/* Address & time – read-only display */}
                <section className="co-card co-stack">
                  <h3>Địa chỉ &amp; thời gian nấu</h3>

                  {loading ? (
                    <div className="co-stack" style={{ gap: 12 }}>
                      <SkeletonBlock height={16} />
                      <SkeletonBlock height={16} width="70%" />
                      <SkeletonBlock height={16} width="50%" />
                    </div>
                  ) : (
                    <div className="co-info-grid">
                      <div className="co-info-row">
                        <span className="co-info-label">Địa chỉ nấu ăn</span>
                        <span className="co-info-value">{booking?.serviceAddress ?? "—"}</span>
                      </div>
                      <div className="co-info-row">
                        <span className="co-info-label">Ngày dùng bữa</span>
                        <span className="co-info-value">
                          {booking?.scheduledAt ? formatDate(booking.scheduledAt) : "—"}
                        </span>
                      </div>
                      <div className="co-info-row">
                        <span className="co-info-label">Giờ dùng bữa</span>
                        <span className="co-info-value">
                          {booking?.scheduledAt ? formatTime(booking.scheduledAt) : "—"}
                        </span>
                      </div>
                      <div className="co-info-row">
                        <span className="co-info-label">Số người</span>
                        <span className="co-info-value">{booking?.guestCount ?? "—"} người</span>
                      </div>
                      {booking?.customerNote && (
                        <div className="co-info-row">
                          <span className="co-info-label">Ghi chú</span>
                          <span className="co-info-value">{booking.customerNote}</span>
                        </div>
                      )}
                    </div>
                  )}
                </section>

                {/* Payment method */}
                <section className="co-card co-stack">
                  <h3>Phương thức thanh toán</h3>
                  <label className="co-payment-option co-payment-option--selected">
                    <input type="radio" name="payment" value="vnpay" defaultChecked readOnly />
                    <span>
                      <strong>VNPay</strong>
                      <span className="co-small co-muted">Cổng thanh toán VNPay</span>
                    </span>
                  </label>
                </section>
              </div>

              {/* ── Right column – Summary ── */}
              <aside className="co-card co-summary co-stack">
                <h3>Tóm tắt đặt lịch</h3>

                <div className="co-summary-lines">
                  <div className="co-summary-line">
                    <span>
                      Thực đơn ·{" "}
                      {loading ? "…" : `${booking?.guestCount ?? "?"} người`}
                    </span>
                    <strong>
                      {loading ? (
                        <SkeletonBlock height={16} width={80} />
                      ) : (
                        formatCurrency(booking?.totalAmount ?? 0)
                      )}
                    </strong>
                  </div>
                  <div className="co-summary-line">
                    <span>Phí nguyên liệu &amp; công nấu</span>
                    <span className="co-green">Đã bao gồm</span>
                  </div>
                  <div className="co-summary-line">
                    <span>Dọn dẹp gian bếp</span>
                    <span className="co-green">Đã bao gồm</span>
                  </div>
                  <div className="co-summary-line co-summary-line--total">
                    <span>Tổng cộng</span>
                    <strong className="co-total-amount">
                      {loading ? (
                        <SkeletonBlock height={20} width={100} />
                      ) : (
                        formatCurrency(booking?.totalAmount ?? 0)
                      )}
                    </strong>
                  </div>
                </div>

                <label className="co-check">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    disabled={loading}
                  />
                  <span>Tôi đã xem thông tin đặt lịch và chính sách dịch vụ.</span>
                </label>

                <button
                  className="co-btn co-btn--primary co-btn--full"
                  onClick={handlePayment}
                  disabled={!agreed || loading || paying}
                >
                  {paying ? (
                    <>
                      <span className="co-spinner" aria-hidden="true" />
                      Đang chuyển đến VNPay...
                    </>
                  ) : (
                    <>
                      Thanh toán
                    </>
                  )}
                </button>

                {booking?.bookingCode && (
                  <p className="co-small co-muted co-booking-code">
                    Mã đặt lịch: <strong>#{booking.bookingCode}</strong>
                  </p>
                )}
              </aside>
            </div>
          )}
        </div>
      </main>
    </>
  );
}

// ─── Scoped CSS ───────────────────────────────────────────────────────────────

const CSS = `
@keyframes co-skeleton-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

@keyframes co-spin {
  to { transform: rotate(360deg); }
}

.co-page {
  font-family: "Inter", system-ui, sans-serif;
  background: #f8f7f2;
  color: #1f2937;
  font-size: 14px;
  line-height: 1.5;
  min-height: 100vh;
  padding-bottom: 60px;
}


/* ── Container & breadcrumb ── */
.co-container {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 16px;
}
.co-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 18px 0 10px;
  font-size: 13px;
  color: #6b7280;
}
.co-breadcrumb a { color: #6b7280; text-decoration: none; }
.co-breadcrumb a:hover { color: #297a38; }

.co-page-heading { margin-bottom: 24px; }
.co-page-heading h1 { font-size: 26px; font-weight: 700; margin: 0 0 6px; }
.co-lead { color: #4b5563; margin: 0; }

/* ── Layout ── */
.co-split {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}
@media (max-width: 860px) {
  .co-split { grid-template-columns: 1fr; }
  .co-summary { order: -1; }
}

.co-stack { display: flex; flex-direction: column; gap: 16px; }

/* ── Card ── */
.co-card {
  background: #fff;
  border-radius: 14px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 4px rgba(0,0,0,.04);
  padding: 24px;
}
.co-card h3 {
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 4px;
  color: #111827;
}

/* ── Dish list ── */
.co-dish-list { display: flex; flex-direction: column; gap: 12px; }
.co-order-item {
  display: flex;
  align-items: center;
  gap: 14px;
}
.co-dish-avatar {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
  border: 1px solid #f3f4f6;
}
.co-dish-avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  font-size: 24px;
}
.co-dish-avatar--skeleton {
  background: linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);
  background-size: 200% 100%;
  animation: co-skeleton-shimmer 1.4s infinite;
}
.co-dish-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 2px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.co-dish-qty {
  font-size: 12px;
  font-weight: 400;
  color: #6b7280;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 1px 7px;
}

/* ── Chef ── */
.co-chef-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}
.co-chef-avatar--fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #297a38, #4ade80);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
}
.co-chef-avatar--skeleton {
  background: linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);
  background-size: 200% 100%;
  animation: co-skeleton-shimmer 1.4s infinite;
  border-radius: 50%;
}
.co-chef-name { font-size: 15px; font-weight: 600; margin: 0 0 4px; }
.co-status-accepted { margin: 0 0 2px; color: #374151; }
.co-status-confirmed {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #15803d;
  font-weight: 500;
  margin: 0;
}

/* ── Info grid ── */
.co-info-grid { display: flex; flex-direction: column; gap: 10px; }
.co-info-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  font-size: 14px;
}
.co-info-label { color: #6b7280; flex-shrink: 0; min-width: 140px; }
.co-info-value { color: #111827; font-weight: 500; text-align: right; }

/* ── Payment option ── */
.co-payment-option {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  cursor: pointer;
  transition: border-color .15s;
}
.co-payment-option--selected { border-color: #297a38; background: #f4fbf4; }
.co-payment-option input[type=radio] { accent-color: #297a38; width: 16px; height: 16px; }
.co-payment-option span { display: flex; flex-direction: column; gap: 2px; }

/* ── Summary sidebar ── */
.co-summary { position: sticky; top: 24px; }
.co-summary-lines { display: flex; flex-direction: column; gap: 10px; }
.co-summary-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
.co-summary-line--total {
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
  font-size: 15px;
}
.co-total-amount { color: #297a38; font-size: 18px; }
.co-green { color: #15803d; font-weight: 500; }
.co-booking-code { text-align: center; }

/* ── Checkbox ── */
.co-check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
}
.co-check input[type=checkbox] { margin-top: 2px; accent-color: #297a38; }

/* ── Buttons ── */
.co-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: opacity .15s, transform .1s;
  text-decoration: none;
}
.co-btn:disabled { opacity: .55; cursor: not-allowed; transform: none !important; }
.co-btn:not(:disabled):hover { opacity: .88; }
.co-btn:not(:disabled):active { transform: scale(.97); }
.co-btn--primary { background: #297a38; color: #fff; }
.co-btn--full { width: 100%; }

/* ── Spinner ── */
.co-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: co-spin .7s linear infinite;
  display: inline-block;
}

/* ── Error state ── */
.co-error-state {
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 14px;
  border: 1px solid #fecaca;
  margin-bottom: 24px;
}
.co-error-state__icon { font-size: 40px; display: block; margin-bottom: 12px; }
.co-error-state p { color: #6b7280; margin-bottom: 20px; }

/* ── Helpers ── */
.co-small { font-size: 12px; }
.co-muted { color: #6b7280; }
.co-menu-header { margin-bottom: 4px; }
.co-menu-header h3 { margin: 0; }
`;
