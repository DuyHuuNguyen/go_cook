import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { SellerWorkspace } from "../../components/seller/SellerWorkspace";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { getChefWeeklySchedule } from "../../clients/ChefDashboardClient";
import type {
  ChefScheduleItem,
  ChefWeeklyScheduleResponse,
} from "../../types/ChefScheduleTypes";
import { money } from "./sellerMockData";

const DAY_LABELS_VI: Record<string, string> = {
  SUN: "Chủ nhật",
  MON: "Thứ hai",
  TUE: "Thứ ba",
  WED: "Thứ tư",
  THU: "Thứ năm",
  FRI: "Thứ sáu",
  SAT: "Thứ bảy",
};

const STATUS_BADGES: Record<
  string,
  { label: string; bg: string; color: string }
> = {
  CONFIRMED: {
    label: "Đã xác nhận",
    bg: "#e6f4ea",
    color: "#137333",
  },
  HELD: {
    label: "Tạm giữ",
    bg: "#fef7e0",
    color: "#b06000",
  },
  COMPLETED: {
    label: "Hoàn thành",
    bg: "#e8f0fe",
    color: "#1a73e8",
  },
  CANCELLED: {
    label: "Đã hủy",
    bg: "#f1f3f4",
    color: "#5f6368",
  },
};

function formatTime(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "";
  }
}

export function SellerScheduleTestPage() {
  useDocumentTitle("Test Lịch trình tuần đầu bếp | GO Cook");
  const [params, setParams] = useSearchParams();
  const dateParam = params.get("date") || "";

  const [scheduleData, setScheduleData] =
    useState<ChefWeeklyScheduleResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<ChefScheduleItem | null>(
    null,
  );
  const [showJson, setShowJson] = useState<boolean>(false);

  const fetchSchedule = (targetDate?: string) => {
    setLoading(true);
    setError(null);
    getChefWeeklySchedule(targetDate || undefined)
      .then((res) => {
        setScheduleData(res);
      })
      .catch((err) => {
        console.error("Lỗi khi tải lịch trình tuần:", err);
        setError("Không thể tải lịch trình tuần từ server. Vui lòng thử lại.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSchedule(dateParam);
  }, [dateParam]);

  const handlePrevWeek = () => {
    if (scheduleData?.prevWeekStartDate) {
      setParams({ date: scheduleData.prevWeekStartDate });
    }
  };

  const handleNextWeek = () => {
    if (scheduleData?.nextWeekStartDate) {
      setParams({ date: scheduleData.nextWeekStartDate });
    }
  };

  const handleToday = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    setParams({ date: todayStr });
  };

  const handleDateChange = (newDate: string) => {
    if (newDate) {
      setParams({ date: newDate });
    }
  };

  const allItems = scheduleData?.allSchedules || [];
  const confirmedCount = allItems.filter((i) => i.status === "CONFIRMED").length;
  const heldCount = allItems.filter((i) => i.status === "HELD").length;
  const completedCount = allItems.filter((i) => i.status === "COMPLETED").length;

  return (
    <SellerWorkspace>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 0" }}>
        {/* Top header navigation like Google Calendar */}
        <div
          className="card"
          style={{
            marginBottom: 20,
            padding: "16px 24px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              className="btn secondary"
              onClick={handleToday}
              title="Nhảy về tuần hiện tại"
            >
              Hôm nay
            </button>
            <div style={{ display: "flex", gap: 4 }}>
              <button
                className="btn secondary"
                onClick={handlePrevWeek}
                title="Tuần trước"
                style={{ padding: "6px 14px", fontSize: 18 }}
              >
                ‹
              </button>
              <button
                className="btn secondary"
                onClick={handleNextWeek}
                title="Tuần sau"
                style={{ padding: "6px 14px", fontSize: 18 }}
              >
                ›
              </button>
            </div>
            <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: 700 }}>
              {scheduleData
                ? `Tháng ${scheduleData.startDate.slice(5, 7)}, ${scheduleData.year}`
                : "Lịch trình tuần"}
              <span
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 400,
                  color: "#666",
                  marginLeft: 12,
                }}
              >
                ({scheduleData?.displayRange || "Đang tải..."})
              </span>
            </h2>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 14,
              }}
            >
              Chọn ngày:
              <input
                type="date"
                value={dateParam || new Date().toISOString().slice(0, 10)}
                onChange={(e) => handleDateChange(e.target.value)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                }}
              />
            </label>
            <Link to="/seller/schedule" className="btn secondary sm">
              Quay lại Lịch phục vụ
            </Link>
          </div>
        </div>

        {/* Stats summary bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16,
            marginBottom: 20,
          }}
        >
          <div
            className="card"
            style={{
              padding: 16,
              borderLeft: "4px solid #1a73e8",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#666" }}>Tổng lịch tuần</div>
              <strong style={{ fontSize: 24, color: "#1a73e8" }}>
                {allItems.length}
              </strong>
            </div>
            <span style={{ fontSize: 24 }}>📅</span>
          </div>

          <div
            className="card"
            style={{
              padding: 16,
              borderLeft: "4px solid #137333",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#666" }}>Đã xác nhận</div>
              <strong style={{ fontSize: 24, color: "#137333" }}>
                {confirmedCount}
              </strong>
            </div>
            <span style={{ fontSize: 24 }}>✅</span>
          </div>

          <div
            className="card"
            style={{
              padding: 16,
              borderLeft: "4px solid #b06000",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#666" }}>Đang tạm giữ</div>
              <strong style={{ fontSize: 24, color: "#b06000" }}>
                {heldCount}
              </strong>
            </div>
            <span style={{ fontSize: 24 }}>⏳</span>
          </div>

          <div
            className="card"
            style={{
              padding: 16,
              borderLeft: "4px solid #185abc",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{ fontSize: 12, color: "#666" }}>Đã hoàn thành</div>
              <strong style={{ fontSize: 24, color: "#185abc" }}>
                {completedCount}
              </strong>
            </div>
            <span style={{ fontSize: 24 }}>🍽️</span>
          </div>
        </div>

        {error && (
          <div
            className="notice warm"
            style={{ marginBottom: 16 }}
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Google Calendar 7-Day Week Columns */}
        <div
          className="card"
          style={{ padding: 16, overflowX: "auto", minHeight: 450 }}
        >
          {loading ? (
            <div
              style={{
                padding: "60px 0",
                textAlign: "center",
                color: "#666",
              }}
            >
              Đang tải lịch trình tuần của đầu bếp...
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, minmax(140px, 1fr))",
                gap: 8,
              }}
            >
              {scheduleData?.days.map((day) => {
                const dayNum = day.date.slice(8);
                const dayLabel = DAY_LABELS_VI[day.dayOfWeek] || day.dayOfWeek;

                return (
                  <div
                    key={day.date}
                    style={{
                      border: day.isToday
                        ? "2px solid #1a73e8"
                        : "1px solid #e0e0e0",
                      borderRadius: 12,
                      background: day.isToday ? "#f8fbff" : "#ffffff",
                      display: "flex",
                      flexDirection: "column",
                      minHeight: 380,
                    }}
                  >
                    {/* Day Column Header (Google Calendar style) */}
                    <div
                      style={{
                        padding: "12px 8px",
                        textAlign: "center",
                        borderBottom: "1px solid #eee",
                        backgroundColor: day.isToday ? "#e8f0fe" : "#fdfdfd",
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          textTransform: "uppercase",
                          color: day.isToday ? "#1a73e8" : "#70757a",
                        }}
                      >
                        {day.dayOfWeek} · {dayLabel}
                      </div>
                      <div style={{ marginTop: 4 }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            backgroundColor: day.isToday
                              ? "#1a73e8"
                              : "transparent",
                            color: day.isToday ? "#fff" : "#3c4043",
                            fontSize: 18,
                            fontWeight: 700,
                          }}
                        >
                          {dayNum}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: 11,
                          color: day.scheduleCount > 0 ? "#137333" : "#9aa0a6",
                          marginTop: 2,
                        }}
                      >
                        {day.scheduleCount > 0
                          ? `${day.scheduleCount} lịch hẹn`
                          : "Trống lịch"}
                      </div>
                    </div>

                    {/* Schedule Cards within the Day */}
                    <div
                      style={{
                        padding: 8,
                        display: "flex",
                        flexDirection: "column",
                        gap: 8,
                        flex: 1,
                      }}
                    >
                      {day.items.length === 0 ? (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flex: 1,
                            color: "#c4c7c5",
                            fontSize: 12,
                            fontStyle: "italic",
                          }}
                        >
                          Chưa có lịch
                        </div>
                      ) : (
                        day.items.map((item) => {
                          const badge = STATUS_BADGES[item.status] || {
                            label: item.status,
                            bg: "#f1f3f4",
                            color: "#3c4043",
                          };

                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedItem(item)}
                              style={{
                                padding: "8px 10px",
                                borderRadius: 8,
                                border: "1px solid #dadce0",
                                background: "#ffffff",
                                cursor: "pointer",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                                transition: "all 0.15s ease",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = "#1a73e8";
                                e.currentTarget.style.transform =
                                  "translateY(-1px)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = "#dadce0";
                                e.currentTarget.style.transform = "none";
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  marginBottom: 4,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: "#1a73e8",
                                  }}
                                >
                                  ⏰ {formatTime(item.startAt)}–
                                  {formatTime(item.endAt)}
                                </span>
                                <span
                                  style={{
                                    fontSize: 10,
                                    padding: "2px 6px",
                                    borderRadius: 4,
                                    backgroundColor: badge.bg,
                                    color: badge.color,
                                    fontWeight: 600,
                                  }}
                                >
                                  {badge.label}
                                </span>
                              </div>

                              <div
                                style={{
                                  fontSize: 12,
                                  fontWeight: 600,
                                  color: "#202124",
                                  marginBottom: 2,
                                }}
                              >
                                {item.bookingCode || `Đơn #${item.bookingId}`}
                              </div>

                              {item.customerName && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#5f6368",
                                    marginBottom: 2,
                                  }}
                                >
                                  Khách: {item.customerName}
                                </div>
                              )}

                              {item.serviceAddress && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    color: "#70757a",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                  title={item.serviceAddress}
                                >
                                  📍 {item.serviceAddress}
                                </div>
                              )}

                              {item.totalAmount !== undefined && (
                                <div
                                  style={{
                                    fontSize: 11,
                                    fontWeight: 600,
                                    color: "#137333",
                                    marginTop: 4,
                                  }}
                                >
                                  {money(item.totalAmount)}
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Item detail modal */}
        {selectedItem && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 100,
              padding: 16,
            }}
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="card"
              style={{
                width: "100%",
                maxWidth: 480,
                padding: 24,
                backgroundColor: "#fff",
                borderRadius: 16,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h3 style={{ margin: 0 }}>Chi tiết lịch trình</h3>
                <button
                  className="btn secondary sm"
                  onClick={() => setSelectedItem(null)}
                >
                  ✕
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  fontSize: 14,
                }}
              >
                <div>
                  <strong>Mã booking:</strong>{" "}
                  {selectedItem.bookingCode || `#${selectedItem.bookingId}`}
                </div>
                <div>
                  <strong>Trạng thái:</strong>{" "}
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: 4,
                      backgroundColor:
                        STATUS_BADGES[selectedItem.status]?.bg || "#f1f3f4",
                      color:
                        STATUS_BADGES[selectedItem.status]?.color || "#333",
                      fontWeight: 600,
                    }}
                  >
                    {STATUS_BADGES[selectedItem.status]?.label ||
                      selectedItem.status}
                  </span>
                </div>
                <div>
                  <strong>Thời gian:</strong>{" "}
                  {formatTime(selectedItem.startAt)} –{" "}
                  {formatTime(selectedItem.endAt)} (
                  {new Date(selectedItem.startAt).toLocaleDateString("vi-VN")})
                </div>
                <div>
                  <strong>Khách hàng:</strong>{" "}
                  {selectedItem.customerName || "Chưa có"}
                </div>
                {selectedItem.customerPhone && (
                  <div>
                    <strong>Số điện thoại:</strong>{" "}
                    {selectedItem.customerPhone}
                  </div>
                )}
                <div>
                  <strong>Địa chỉ:</strong>{" "}
                  {selectedItem.serviceAddress || "Chưa có"}
                </div>
                {selectedItem.guestCount !== undefined && (
                  <div>
                    <strong>Số lượng khách:</strong> {selectedItem.guestCount}
                  </div>
                )}
                {selectedItem.totalAmount !== undefined && (
                  <div>
                    <strong>Tổng thanh toán:</strong>{" "}
                    {money(selectedItem.totalAmount)}
                  </div>
                )}
                {selectedItem.dishes && selectedItem.dishes.length > 0 && (
                  <div>
                    <strong>Món ăn:</strong>
                    <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                      {selectedItem.dishes.map((dish, idx) => (
                        <li key={idx}>{dish}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div style={{ marginTop: 20, textAlign: "right" }}>
                <button
                  className="btn primary sm"
                  onClick={() => setSelectedItem(null)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Debug / Raw API Response */}
        <div style={{ marginTop: 24 }}>
          <button
            className="btn secondary sm"
            onClick={() => setShowJson(!showJson)}
          >
            {showJson ? "Ẩn JSON response API" : "Xem JSON response API (Debug)"}
          </button>
          {showJson && (
            <pre
              style={{
                marginTop: 12,
                padding: 16,
                borderRadius: 8,
                backgroundColor: "#202124",
                color: "#e8eaed",
                fontSize: 12,
                maxHeight: 400,
                overflow: "auto",
              }}
            >
              {JSON.stringify(scheduleData, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </SellerWorkspace>
  );
}

export default SellerScheduleTestPage;

