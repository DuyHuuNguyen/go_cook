import { useState, useMemo } from "react";
import { Link } from "react-router";
import { useChefBooking } from "../../contexts/ChefBookingContext";
import { BookingResponse } from "../../types/BookingTypes";

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  PENDING: {
    label: "Chờ xác nhận",
    bg: "#fff8e6",
    text: "#b76e00",
    border: "#ffe08a",
  },
  PENDING_CHEF_ACCEPTANCE: {
    label: "Chờ đầu bếp nhận",
    bg: "#fff8e6",
    text: "#b76e00",
    border: "#ffe08a",
  },
  MATCHING: {
    label: "Chờ nhận đơn",
    bg: "#eef6ff",
    text: "#1565c0",
    border: "#bbdefb",
  },
  CONFIRMED: {
    label: "Đã chấp nhận",
    bg: "#edf5e7",
    text: "#294d0c",
    border: "#bbf0ba",
  },
  CHEF_ACCEPT: {
    label: "Đầu bếp đã nhận",
    bg: "#edf5e7",
    text: "#294d0c",
    border: "#bbf0ba",
  },
  COMPLETED: {
    label: "Đã hoàn tất",
    bg: "#e8f5e9",
    text: "#1b5e20",
    border: "#a5d6a7",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "#fef3f2",
    text: "#b42318",
    border: "#fecdca",
  },
  CHEF_REJECT: {
    label: "Đã từ chối",
    bg: "#fef3f2",
    text: "#b42318",
    border: "#fecdca",
  },
  REJECTED: {
    label: "Đã từ chối",
    bg: "#fef3f2",
    text: "#b42318",
    border: "#fecdca",
  },
};

function formatDateTime(value: string | number) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("vi-VN");
}

function formatPrice(amount: number) {
  return (amount ?? 0).toLocaleString("vi-VN") + " ₫";
}

export function ChefBookingManagement() {
  const {
    bookings,
    hasNext,
    loading,
    actionLoadingId,
    error,
    loadMoreBookings,
    refreshBookings,
    acceptBooking,
    rejectBooking,
  } = useChefBooking();

  const [activeTab, setActiveTab] = useState<
    "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED"
  >("ALL");

  const [rejectModalBookingId, setRejectModalBookingId] = useState<number | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");

  const filteredBookings = useMemo(() => {
    if (activeTab === "ALL") return bookings;
    if (activeTab === "PENDING") {
      return bookings.filter(
        (b) =>
          b.bookingStatus === "PENDING" ||
          b.bookingStatus === "PENDING_CHEF_ACCEPTANCE" ||
          b.bookingStatus === "MATCHING",
      );
    }
    if (activeTab === "CONFIRMED") {
      return bookings.filter(
        (b) =>
          b.bookingStatus === "CONFIRMED" || b.bookingStatus === "CHEF_ACCEPT",
      );
    }
    if (activeTab === "CANCELLED") {
      return bookings.filter(
        (b) =>
          b.bookingStatus === "CANCELLED" ||
          b.bookingStatus === "REJECTED" ||
          b.bookingStatus === "CHEF_REJECT" ||
          b.bookingStatus === "COMPLETED",
      );
    }
    return bookings;
  }, [bookings, activeTab]);

  const stats = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(
      (b) =>
        b.bookingStatus === "PENDING" ||
        b.bookingStatus === "PENDING_CHEF_ACCEPTANCE" ||
        b.bookingStatus === "MATCHING",
    ).length;
    const confirmed = bookings.filter(
      (b) =>
        b.bookingStatus === "CONFIRMED" || b.bookingStatus === "CHEF_ACCEPT",
    ).length;
    return { total, pending, confirmed };
  }, [bookings]);

  const handleOpenReject = (bookingId: number) => {
    setRejectModalBookingId(bookingId);
    setRejectReason("");
  };

  const handleConfirmReject = async () => {
    if (rejectModalBookingId == null) return;
    await rejectBooking(rejectModalBookingId, rejectReason);
    setRejectModalBookingId(null);
  };

  return (
    <div className="stack" style={{ gap: "20px" }}>
      {/* Header bar */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e6dc",
          borderRadius: "16px",
          padding: "20px 24px",
          boxShadow: "0 4px 20px rgba(40, 61, 20, 0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
        }}
      >
        <div>
          <h2
            style={{
              fontSize: "1.45rem",
              fontWeight: 700,
              color: "#1c1c17",
              margin: "0 0 4px 0",
            }}
          >
            Quản lý đơn đặt bếp
          </h2>
          <p style={{ margin: 0, fontSize: "0.9rem", color: "#65695e" }}>
            Tiếp nhận, xử lý và phản hồi các yêu cầu đặt tiệc / nấu ăn tại gia từ thực khách.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            className="btn secondary"
            disabled={loading}
            onClick={() => void refreshBookings()}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              borderRadius: "10px",
              fontSize: "0.88rem",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            Làm mới
          </button>
        </div>
      </div>

      {/* Metrics & Filter tabs */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            background: "#f0ede4",
            padding: "4px",
            borderRadius: "12px",
            gap: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab("ALL")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: 0,
              background: activeTab === "ALL" ? "#fff" : "transparent",
              fontWeight: activeTab === "ALL" ? 600 : 500,
              color: activeTab === "ALL" ? "#376412" : "#65695e",
              boxShadow:
                activeTab === "ALL" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Tất cả ({stats.total})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PENDING")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: 0,
              background: activeTab === "PENDING" ? "#fff" : "transparent",
              fontWeight: activeTab === "PENDING" ? 600 : 500,
              color: activeTab === "PENDING" ? "#b76e00" : "#65695e",
              boxShadow:
                activeTab === "PENDING"
                  ? "0 2px 6px rgba(0,0,0,0.06)"
                  : "none",
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Chờ xử lý ({stats.pending})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CONFIRMED")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: 0,
              background: activeTab === "CONFIRMED" ? "#fff" : "transparent",
              fontWeight: activeTab === "CONFIRMED" ? 600 : 500,
              color: activeTab === "CONFIRMED" ? "#376412" : "#65695e",
              boxShadow:
                activeTab === "CONFIRMED"
                  ? "0 2px 6px rgba(0,0,0,0.06)"
                  : "none",
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Đã nhận ({stats.confirmed})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CANCELLED")}
            style={{
              padding: "6px 14px",
              borderRadius: "8px",
              border: 0,
              background: activeTab === "CANCELLED" ? "#fff" : "transparent",
              fontWeight: activeTab === "CANCELLED" ? 600 : 500,
              color: activeTab === "CANCELLED" ? "#b42318" : "#65695e",
              boxShadow:
                activeTab === "CANCELLED"
                  ? "0 2px 6px rgba(0,0,0,0.06)"
                  : "none",
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Hoàn tất / Đã hủy
          </button>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div
          style={{
            background: "#fef3f2",
            border: "1px solid #fecdca",
            borderRadius: "12px",
            padding: "14px 18px",
            color: "#b42318",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            type="button"
            className="btn secondary"
            style={{ padding: "4px 12px", fontSize: "0.85rem" }}
            onClick={() => void refreshBookings()}
          >
            Thử lại
          </button>
        </div>
      )}

      {/* Loading state on initial fetch */}
      {loading && bookings.length === 0 ? (
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e6dc",
            borderRadius: "16px",
            padding: "48px 24px",
            textAlign: "center",
            color: "#65695e",
          }}
        >
          <div
            style={{
              width: "36px",
              height: "36px",
              margin: "0 auto 12px auto",
              border: "3px solid #e5e6dc",
              borderTopColor: "#376412",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          />
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <div>Đang tải danh sách đơn đặt bếp...</div>
        </div>
      ) : filteredBookings.length === 0 ? (
        /* Empty state */
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5e6dc",
            borderRadius: "16px",
            padding: "54px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "60px",
              height: "60px",
              margin: "0 auto 16px auto",
              background: "#edf5e7",
              color: "#376412",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h4
            style={{
              fontSize: "1.15rem",
              fontWeight: 600,
              color: "#1c1c17",
              marginBottom: "6px",
            }}
          >
            Không tìm thấy đơn đặt bếp nào
          </h4>
          <p
            style={{
              color: "#65695e",
              fontSize: "0.9rem",
              maxWidth: "420px",
              margin: "0 auto 16px auto",
            }}
          >
            {activeTab === "ALL"
              ? "Hiện tại bạn chưa có đơn đặt bếp nào từ thực khách."
              : "Không có đơn nào phù hợp với bộ lọc hiện tại."}
          </p>
          <button
            type="button"
            className="btn secondary"
            onClick={() => {
              setActiveTab("ALL");
              void refreshBookings();
            }}
            style={{ padding: "8px 18px", borderRadius: "10px" }}
          >
            Làm mới danh sách
          </button>
        </div>
      ) : (
        /* Booking list cards */
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filteredBookings.map((booking: BookingResponse) => {
            const status = STATUS_CONFIG[booking.bookingStatus] ?? {
              label: booking.bookingStatus || "Không rõ",
              bg: "#f4f4f2",
              text: "#494c44",
              border: "#e5e6dc",
            };
            const isPending =
              booking.bookingStatus === "PENDING" ||
              booking.bookingStatus === "PENDING_CHEF_ACCEPTANCE" ||
              booking.bookingStatus === "MATCHING";
            const isProcessing = actionLoadingId === booking.id;

            return (
              <div
                key={booking.id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e6dc",
                  borderRadius: "16px",
                  padding: "20px 24px",
                  boxShadow: "0 2px 12px rgba(40, 61, 20, 0.04)",
                  transition: "transform 0.15s ease, box-shadow 0.15s ease",
                }}
              >
                {/* Top card info */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    flexWrap: "wrap",
                    gap: "10px",
                    paddingBottom: "14px",
                    borderBottom: "1px solid #f0ede4",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontWeight: 700,
                        fontSize: "1.05rem",
                        color: "#1c1c17",
                      }}
                    >
                      #{booking.bookingCode || booking.id}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: "20px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        background: status.bg,
                        color: status.text,
                        border: `1px solid ${status.border}`,
                      }}
                    >
                      {status.label}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.82rem", color: "#8a8f82" }}>
                    Tạo lúc: {formatDateTime(booking.createdAt)}
                  </div>
                </div>

                {/* Main details grid */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(260px, 1fr))",
                    gap: "16px",
                    marginBottom: "16px",
                    fontSize: "0.9rem",
                  }}
                >
                  <div>
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#65695e" }}>Thời gian phục vụ: </span>
                      <strong style={{ color: "#1c1c17" }}>
                        {formatDateTime(booking.scheduledAt)}
                      </strong>
                    </div>
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#65695e" }}>Số lượng khách: </span>
                      <strong style={{ color: "#1c1c17" }}>
                        {booking.guestCount} người
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "#65695e" }}>Ước tính thanh toán: </span>
                      <strong
                        style={{
                          color: "#376412",
                          fontSize: "1.05rem",
                          fontWeight: 700,
                        }}
                      >
                        {formatPrice(booking.totalAmount)}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <div style={{ marginBottom: "8px" }}>
                      <span style={{ color: "#65695e" }}>Địa chỉ phục vụ: </span>
                      <span style={{ color: "#1c1c17", fontWeight: 500 }}>
                        {booking.serviceAddress || "—"}
                      </span>
                    </div>
                    {booking.customerNote && (
                      <div
                        style={{
                          background: "#fcf9f0",
                          border: "1px dashed #d6ceb8",
                          borderRadius: "8px",
                          padding: "8px 12px",
                          fontSize: "0.85rem",
                          color: "#534b33",
                        }}
                      >
                        <strong>Ghi chú từ khách:</strong> {booking.customerNote}
                      </div>
                    )}
                  </div>
                </div>

                {/* Dishes list */}
                {booking.dishes && booking.dishes.length > 0 && (
                  <div
                    style={{
                      background: "#faf9f5",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      marginBottom: "16px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        color: "#65695e",
                        marginBottom: "8px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Món ăn yêu cầu ({booking.dishes.length}):
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px",
                      }}
                    >
                      {booking.dishes.map((dish) => (
                        <span
                          key={dish.dishId}
                          style={{
                            background: "#fff",
                            border: "1px solid #e0dfd5",
                            borderRadius: "6px",
                            padding: "4px 10px",
                            fontSize: "0.83rem",
                            color: "#2f312b",
                          }}
                        >
                          <strong>{dish.dishName}</strong> × {dish.quantity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions bottom bar */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "10px",
                    paddingTop: "12px",
                    borderTop: "1px solid #f0ede4",
                  }}
                >
                  {/* Chat button */}
                  <Link
                    to={`/chat?bookingId=${booking.id}`}
                    state={{
                      bookingId: booking.id,
                      customerId: booking.customerId,
                    }}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 14px",
                      borderRadius: "10px",
                      border: "1px solid #d0d2c7",
                      background: "#fff",
                      color: "#376412",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      textDecoration: "none",
                    }}
                  >
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    Nhắn tin khách
                  </Link>

                  {/* Accept / Reject actions */}
                  {isPending && (
                    <>
                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => handleOpenReject(booking.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "7px 14px",
                          borderRadius: "10px",
                          border: "1px solid #fecdca",
                          background: "#fff",
                          color: "#b42318",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          opacity: isProcessing ? 0.6 : 1,
                        }}
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                        Từ chối
                      </button>

                      <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => void acceptBooking(booking.id)}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "7px 18px",
                          borderRadius: "10px",
                          border: "none",
                          background: "#376412",
                          color: "#fff",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                          cursor: isProcessing ? "not-allowed" : "pointer",
                          opacity: isProcessing ? 0.6 : 1,
                          boxShadow: "0 2px 8px rgba(55, 100, 18, 0.2)",
                        }}
                      >
                        {isProcessing ? (
                          <span>Đang xử lý...</span>
                        ) : (
                          <>
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Chấp nhận đơn
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {/* Keyset pagination "Load more" */}
          {hasNext ? (
            <div style={{ textAlign: "center", marginTop: "12px" }}>
              <button
                type="button"
                className="btn secondary"
                disabled={loading}
                onClick={() => void loadMoreBookings()}
                style={{
                  padding: "10px 24px",
                  borderRadius: "12px",
                  fontWeight: 600,
                }}
              >
                {loading ? "Đang tải thêm..." : "Tải thêm đơn cũ hơn ↓"}
              </button>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#8a8f82",
                fontSize: "0.85rem",
                marginTop: "10px",
              }}
            >
              Đã hiển thị tất cả đơn đặt bếp
            </div>
          )}
        </div>
      )}

      {/* Reject Modal dialog */}
      {rejectModalBookingId != null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "16px",
          }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "16px",
              padding: "24px",
              maxWidth: "460px",
              width: "100%",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h4
              style={{
                margin: "0 0 8px 0",
                fontSize: "1.15rem",
                color: "#1c1c17",
                fontWeight: 700,
              }}
            >
              Từ chối nhận đơn #{rejectModalBookingId}
            </h4>
            <p style={{ color: "#65695e", fontSize: "0.9rem", margin: "0 0 16px 0" }}>
              Bạn có chắc chắn muốn từ chối đơn đặt này? Bạn có thể nhập lý do để thông báo cho khách hàng.
            </p>

            <textarea
              rows={3}
              placeholder="Lý do từ chối (ví dụ: bận lịch đột xuất, vượt quá cự ly phục vụ...)"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "10px",
                border: "1px solid #d0d2c7",
                fontSize: "0.88rem",
                marginBottom: "20px",
                outline: "none",
                resize: "vertical",
              }}
            />

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                type="button"
                className="btn secondary"
                onClick={() => setRejectModalBookingId(null)}
                style={{ padding: "8px 16px", borderRadius: "10px" }}
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmReject()}
                style={{
                  background: "#b42318",
                  color: "#fff",
                  border: "none",
                  padding: "8px 18px",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                  cursor: "pointer",
                }}
              >
                Xác nhận từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default ChefBookingManagement;

