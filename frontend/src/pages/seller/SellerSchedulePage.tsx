import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { SellerWorkspace } from "../../components/seller/SellerWorkspace";
import { useSellerDemo } from "../../contexts/SellerDemoContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  DEMO_TODAY,
  displayDate,
  endTime,
  isBooked,
  orderLabels,
  orderUrl,
} from "./sellerMockData";

function dayOffset(date: string, count: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + count);
  return value.toISOString().slice(0, 10);
}
export function SellerSchedulePage() {
  useDocumentTitle("Lịch phục vụ | GO Cook");
  const { orders, slots, addSlot, removeSlot, toggleSlot } = useSellerDemo();
  const [params, setParams] = useSearchParams();
  const paramDate = params.get("date") || "";
  const dateValid =
    /^\d{4}-\d{2}-\d{2}$/.test(paramDate) &&
    !Number.isNaN(Date.parse(paramDate)) &&
    paramDate.slice(0, 4) >= "2000" &&
    paramDate.slice(0, 4) <= "2099";
  const date = dateValid ? paramDate : DEMO_TODAY;
  const [start, setStart] = useState("09:00");
  const [end, setEnd] = useState("12:00");
  const [available, setAvailable] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [removeId, setRemoveId] = useState("");
  const bookings = orders
    .filter((order) => isBooked(order.status) && order.date === date)
    .sort((a, b) => a.time.localeCompare(b.time));
  const daySlots = slots
    .filter((slot) => slot.date === date)
    .sort((a, b) => a.start.localeCompare(b.start));
  function action(callback: () => void, message: string) {
    try {
      callback();
      setError("");
      setNotice(message);
      setRemoveId("");
    } catch (err) {
      setError((err as Error).message);
      setNotice("");
    }
  }
  return (
    <SellerWorkspace
      title="Lịch phục vụ"
      description="Chủ động thời gian, dành trọn tâm sức cho từng bữa ăn."
    >
      <div className="chef-demo-banner">
        <strong>Lịch mẫu · Giờ Việt Nam</strong>
        <span>
          Không nhận hai đơn trùng giờ. Khung giờ liền nhau được phép.
        </span>
      </div>
      <section className="card stack">
        <div className="between chef-section-heading">
          <div>
            <p className="eyebrow">Kế hoạch của bạn</p>
            <h2>
              {displayDate(date)} — {displayDate(dayOffset(date, 6))}
            </h2>
          </div>
          <div className="row">
            <button
              className="btn secondary sm"
              aria-label="7 ngày trước"
              onClick={() => setParams({ date: dayOffset(date, -7) })}
            >
              ←
            </button>
            <button
              className="btn secondary sm"
              onClick={() => setParams({ date: DEMO_TODAY })}
            >
              Hôm nay mẫu
            </button>
            <button
              className="btn secondary sm"
              aria-label="7 ngày sau"
              onClick={() => setParams({ date: dayOffset(date, 7) })}
            >
              →
            </button>
          </div>
        </div>
        <div className="chef-week">
          {Array.from({ length: 7 }, (_, index) => {
            const day = dayOffset(date, index);
            const count = orders.filter(
              (order) => isBooked(order.status) && order.date === day,
            ).length;
            const open = slots.some(
              (slot) => slot.date === day && slot.available,
            );
            return (
              <button
                className={`chef-day ${index === 0 ? "is-today" : ""}`}
                key={day}
                aria-pressed={index === 0}
                onClick={() => setParams({ date: day })}
              >
                <span>
                  {new Date(`${day}T12:00:00Z`).toLocaleDateString("vi-VN", {
                    weekday: "short",
                    timeZone: "UTC",
                  })}
                </span>
                <strong>{day.slice(8)}</strong>
                <small>
                  {count
                    ? `${count} lịch đã nhận`
                    : open
                      ? "Đang mở lịch"
                      : "Chưa mở lịch"}
                </small>
              </button>
            );
          })}
        </div>
      </section>
      {error && (
        <p className="notice warm" role="alert">
          {error}
        </p>
      )}
      {notice && (
        <p className="notice" role="status">
          {notice}
        </p>
      )}
      <div className="chef-detail-grid">
        <section className="card stack">
          <div>
            <p className="eyebrow">Khung giờ nhận nấu</p>
            <h2>Thiết lập lịch</h2>
          </div>
          <form
            className="stack-sm"
            onSubmit={(e) => {
              e.preventDefault();
              action(
                () =>
                  addSlot({
                    id: crypto.randomUUID(),
                    date,
                    start,
                    end,
                    available,
                  }),
                "Đã lưu khung giờ mẫu.",
              );
            }}
          >
            <label className="field">
              Ngày phục vụ
              <input
                required
                type="date"
                min="2000-01-01"
                max="2099-12-31"
                value={date}
                onChange={(e) => {
                  if (e.target.value) setParams({ date: e.target.value });
                }}
              />
            </label>
            <div className="grid grid-2">
              <label className="field">
                Từ giờ
                <input
                  required
                  type="time"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                />
              </label>
              <label className="field">
                Đến giờ
                <input
                  required
                  type="time"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                />
              </label>
            </div>
            <label className="row">
              <input
                type="checkbox"
                checked={available}
                onChange={(e) => setAvailable(e.target.checked)}
              />{" "}
              Nhận đơn trong khung giờ này
            </label>
            <button className="btn">Lưu khung giờ</button>
            <p className="small muted">
              Không tạo khung chồng lên khung đã có. Bạn có thể mở/đóng hoặc xóa
              khung chưa có booking trước khi thiết lập lại.
            </p>
          </form>
        </section>
        <section className="card stack">
          <h2>Khung giờ ngày {displayDate(date)}</h2>
          {daySlots.map((slot) => (
            <article className="soft stack-sm" key={slot.id}>
              <div className="between">
                <strong>
                  {slot.start}–{slot.end}
                </strong>
                <span className={`badge ${slot.available ? "" : "gray"}`}>
                  {slot.available ? "Mở nhận nấu" : "Đóng nhận nấu"}
                </span>
              </div>
              <div className="row">
                <button
                  className="btn secondary sm"
                  onClick={() =>
                    action(
                      () => toggleSlot(slot.id),
                      "Đã cập nhật trạng thái khung giờ.",
                    )
                  }
                >
                  {slot.available ? "Đóng khung giờ" : "Mở khung giờ"}
                </button>
                <button
                  className="btn ghost sm"
                  onClick={() => setRemoveId(slot.id)}
                >
                  Xóa
                </button>
              </div>
              {removeId === slot.id && (
                <div className="row">
                  <span className="small">Xóa khung giờ này?</span>
                  <button
                    className="btn secondary sm"
                    onClick={() =>
                      action(() => removeSlot(slot.id), "Đã xóa khung giờ.")
                    }
                  >
                    Xác nhận
                  </button>
                  <button
                    className="btn ghost sm"
                    onClick={() => setRemoveId("")}
                  >
                    Hủy
                  </button>
                </div>
              )}
            </article>
          ))}
          {!daySlots.length && (
            <p className="muted">
              Chưa có khung giờ. Thêm lịch để có thể nhận đơn trong ngày này.
            </p>
          )}
        </section>
      </div>
      <section className="card stack">
        <div className="between">
          <h2>Lịch đã được đặt</h2>
          <span className="badge gray">{bookings.length} đơn</span>
        </div>
        {bookings.map((order) => (
          <Link className="chef-booking" to={orderUrl(order.id)} key={order.id}>
            <span className="chef-time">
              {order.time}–{endTime(order)}
            </span>
            <div>
              <strong>{order.menu}</strong>
              <p className="small muted">
                {order.customer} · {order.guests} khách · {order.id}
              </p>
            </div>
            <span className="badge gold">{orderLabels[order.status]}</span>
          </Link>
        ))}
        {!bookings.length && (
          <p className="muted">
            Chưa có đơn đã nhận trong ngày này. Đơn chờ xác nhận chưa được tính
            là booking.
          </p>
        )}
      </section>
    </SellerWorkspace>
  );
}
