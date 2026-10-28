import { Link } from "react-router";
import { SellerWorkspace } from "../../components/seller/SellerWorkspace";
import { useSellerDemo } from "../../contexts/SellerDemoContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  DEMO_TODAY,
  displayDate,
  endTime,
  isBooked,
  money,
  orderLabels,
  orderUrl,
} from "./sellerMockData";

export function SellerDashboardPage() {
  useDocumentTitle("Tổng quan đầu bếp | GO Cook");
  const { orders, slots } = useSellerDemo();
  const pending = orders.filter((order) => order.status === "PENDING");
  const serving = orders.filter((order) =>
    ["CONFIRMED", "PREPARING", "COOKING"].includes(order.status),
  );
  const awaiting = orders.filter(
    (order) => order.status === "AWAITING_ACCEPTANCE",
  );
  const earned = orders
    .filter(
      (order) =>
        order.status === "COMPLETED" && order.releasedAt?.startsWith("2026-10"),
    )
    .reduce((sum, order) => sum + order.total * 0.85, 0);
  const today = orders
    .filter(
      (order) =>
        order.date === DEMO_TODAY &&
        isBooked(order.status) &&
        order.status !== "COMPLETED",
    )
    .sort((a, b) => a.time.localeCompare(b.time));
  return (
    <SellerWorkspace>
      <div className="chef-demo-banner">
        <span>
          <strong>Dữ liệu mẫu</strong> · Thứ Tư, 14/10/2026
        </span>
        <span>Thao tác thử đặt lại khi tải lại trang.</span>
      </div>
      <div className="chef-metrics">
        {[
          ["Đơn mới cần nhận", pending.length, "Đã thanh toán online"],
          ["Đang phục vụ", serving.length, "Đã nhận · chuẩn bị · đang nấu"],
          ["Chờ nghiệm thu", awaiting.length, "Chờ khách xác nhận hoàn thành"],
          ["Thu nhập tháng 10", money(earned), "85% từ đơn đã nghiệm thu"],
        ].map(([title, value, hint], index) => (
          <article className="card chef-metric" key={title}>
            <div className="between">
              <span className="small muted">{title}</span>
              <span className="chef-metric-number">0{index + 1}</span>
            </div>
            <strong className="chef-metric-value">{value}</strong>
            <span className="small muted">{hint}</span>
          </article>
        ))}
      </div>
      <section className="chef-today card">
        <div className="stack-sm">
          <p className="eyebrow">Từ căn bếp đến niềm vui</p>
          <h2>Lịch nấu hôm nay</h2>
          <p className="muted">Mọi thứ đã sẵn sàng cho những bữa ăn ấm áp.</p>
          <Link className="text-link" to="/seller/schedule">
            Xem lịch phục vụ →
          </Link>
        </div>
        <div className="stack-sm">
          {today.length ? (
            today.map((order) => (
              <Link
                className="chef-today-order"
                key={order.id}
                to={orderUrl(order.id)}
              >
                <span className="chef-time">
                  {order.time}
                  <small>{order.guests} khách</small>
                </span>
                <span>
                  <strong>{order.menu}</strong>
                  <small>
                    {order.customer} · {orderLabels[order.status]}
                  </small>
                </span>
                <span aria-hidden="true">↗</span>
              </Link>
            ))
          ) : (
            <p>Hôm nay chưa có lịch nấu.</p>
          )}
        </div>
      </section>
      <section className="card stack">
        <div className="between chef-section-heading">
          <div>
            <p className="eyebrow">Sẵn sàng vào bếp</p>
            <h2>
              Đơn mới cần xác nhận{" "}
              <span className="badge gold">{pending.length} đơn</span>
            </h2>
          </div>
          <Link className="text-link" to="/seller/orders">
            Tất cả đơn đặt nấu →
          </Link>
        </div>
        {pending.length ? (
          <div className="chef-request-grid">
            {pending.map((order) => (
              <article className="chef-request" key={order.id}>
                <div className="between">
                  <strong>{order.id}</strong>
                  <span className="badge">Đã thanh toán</span>
                </div>
                <h3>{order.menu}</h3>
                <p className="muted">
                  {order.customer} · {order.guests} khách
                </p>
                <p>
                  ◷ {order.time}–{endTime(order)} · {displayDate(order.date)}
                </p>
                <p className="muted">
                  {order.serviceType === "MENU"
                    ? "Thực đơn có sẵn"
                    : "Theo ngân sách"}
                </p>
                <div className="between">
                  <strong className="green">{money(order.total)}</strong>
                  <Link className="btn sm" to={orderUrl(order.id)}>
                    Xem & xử lý
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="soft">
            Bạn đã xử lý hết đơn mới. Chúc bạn một ngày làm việc vui vẻ!
          </div>
        )}
      </section>
      <section className="card stack">
        <div className="between">
          <div>
            <p className="eyebrow">Theo dõi công việc</p>
            <h2>Đơn đặt nấu gần đây</h2>
          </div>
          <Link className="text-link" to="/seller/orders">
            Xem tất cả →
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <caption>5 đơn mới nhất của Bếp Cô Mai</caption>
            <thead>
              <tr>
                <th>Mã đơn / Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Lịch nấu</th>
                <th>Giá trị đơn</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.id}</strong>
                    <div className="small muted">{order.customer}</div>
                  </td>
                  <td>
                    {order.menu}
                    <div className="small muted">
                      {order.guests} khách · {order.serviceType}
                    </div>
                  </td>
                  <td>
                    {displayDate(order.date)}
                    <div className="small muted">{order.time}</div>
                  </td>
                  <td>{money(order.total)}</td>
                  <td>
                    <span
                      className={`badge ${order.status === "REJECTED" ? "red" : "gold"}`}
                    >
                      {orderLabels[order.status]}
                    </span>
                  </td>
                  <td>
                    <Link className="btn secondary sm" to={orderUrl(order.id)}>
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card stack-sm">
        <p className="eyebrow">Kế hoạch tuần này</p>
        <div className="between">
          <h2>Lịch phục vụ 7 ngày</h2>
          <Link className="text-link" to="/seller/schedule">
            Quản lý lịch →
          </Link>
        </div>
        <div className="chef-week">
          {Array.from({ length: 7 }, (_, index) => {
            const day = 14 + index;
            const date = `2026-10-${day}`;
            const count = orders.filter(
              (order) => order.date === date && isBooked(order.status),
            ).length;
            const open = slots.some(
              (slot) => slot.date === date && slot.available,
            );
            return (
              <Link
                to={`/seller/schedule?date=${date}`}
                className={`chef-day ${index === 0 ? "is-today" : ""}`}
                key={day}
              >
                <span>{["T4", "T5", "T6", "T7", "CN", "T2", "T3"][index]}</span>
                <strong>{day}</strong>
                <small>
                  {count
                    ? `${count} lịch đã nhận`
                    : open
                      ? "Đang mở lịch"
                      : "Chưa mở lịch"}
                </small>
              </Link>
            );
          })}
        </div>
      </section>
    </SellerWorkspace>
  );
}
