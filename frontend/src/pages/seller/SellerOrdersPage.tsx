import { useState } from "react";
import { Link } from "react-router";
import { SellerWorkspace } from "../../components/seller/SellerWorkspace";
import { useSellerDemo } from "../../contexts/SellerDemoContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { displayDate, money, orderLabels, orderUrl } from "./sellerMockData";

export function SellerOrdersPage() {
  useDocumentTitle("Đơn đặt nấu | GO Cook");
  const { orders } = useSellerDemo();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const invalidRange = !!(from && to && from > to);
  const filtered = orders.filter(
    (order) =>
      !invalidRange &&
      `${order.id} ${order.customer} ${order.menu}`
        .toLocaleLowerCase("vi")
        .includes(query.toLocaleLowerCase("vi")) &&
      (!status || order.status === status) &&
      (!from || order.date >= from) &&
      (!to || order.date <= to),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / 5));
  const activePage = Math.min(page, pageCount - 1);
  return (
    <SellerWorkspace
      title="Đơn đặt nấu"
      description="Từ lời hẹn đầu tiên đến bữa ăn trọn vẹn."
    >
      <div className="chef-demo-banner">
        <strong>Dữ liệu mẫu · Tất cả đơn đã thanh toán</strong>
        <span>Chỉ đơn mới có tiền tạm giữ mới có thể nhận.</span>
      </div>
      <div className="chef-status-tabs" aria-label="Lọc nhanh trạng thái">
        {[
          ["", "Tất cả"],
          ["PENDING", "Chờ nhận"],
          ["PREPARING", "Chuẩn bị"],
          ["COOKING", "Đang nấu"],
          ["AWAITING_ACCEPTANCE", "Chờ nghiệm thu"],
        ].map(([value, label]) => (
          <button
            className={`btn sm ${status === value ? "" : "secondary"}`}
            aria-pressed={status === value}
            key={value}
            onClick={() => {
              setStatus(value);
              setPage(0);
            }}
          >
            {label} ·{" "}
            {orders.filter((order) => !value || order.status === value).length}
          </button>
        ))}
      </div>
      <section className="card stack-sm">
        <div className="chef-filters">
          <label className="field">
            Tìm đơn
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Mã đơn, khách hàng, món ăn…"
            />
          </label>
          <label className="field">
            Trạng thái
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Tất cả</option>
              {Object.entries(orderLabels).map(([value, label]) => (
                <option value={value} key={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Ngày nấu từ
            <input
              type="date"
              value={from}
              onChange={(e) => {
                setFrom(e.target.value);
                setPage(0);
              }}
            />
          </label>
          <label className="field">
            Đến ngày
            <input
              type="date"
              value={to}
              onChange={(e) => {
                setTo(e.target.value);
                setPage(0);
              }}
            />
          </label>
        </div>
        {invalidRange && (
          <p className="danger" role="alert">
            Ngày kết thúc phải bằng hoặc sau ngày bắt đầu.
          </p>
        )}
      </section>
      <section className="card stack">
        <div className="between">
          <h2>{filtered.length} đơn đặt nấu</h2>
          <button
            className="text-link chef-text-button"
            onClick={() => {
              setQuery("");
              setStatus("");
              setFrom("");
              setTo("");
              setPage(0);
            }}
          >
            Bỏ bộ lọc
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <caption>
              Danh sách theo ngày phục vụ · Đơn từ chối được giữ để theo dõi
              hoàn tiền
            </caption>
            <thead>
              <tr>
                <th>Đơn / Khách hàng</th>
                <th>Dịch vụ</th>
                <th>Lịch phục vụ</th>
                <th>Giá trị đơn</th>
                <th>Trạng thái</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              {filtered
                .slice(activePage * 5, activePage * 5 + 5)
                .map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.id}</strong>
                      <div className="small muted">{order.customer}</div>
                    </td>
                    <td>
                      {order.menu}
                      <div className="small muted">
                        {order.serviceType === "MENU"
                          ? "Thực đơn có sẵn"
                          : "Theo ngân sách"}{" "}
                        · {order.guests} khách
                      </div>
                    </td>
                    <td>
                      {displayDate(order.date)}
                      <div className="small muted">
                        {order.time} · {order.duration} phút
                      </div>
                    </td>
                    <td>
                      {money(order.total)}
                      <div className="small muted">
                        {order.status === "REJECTED"
                          ? "Chờ hoàn tiền"
                          : order.status === "COMPLETED"
                            ? "Đã nghiệm thu"
                            : "Đang tạm giữ"}
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${order.status === "REJECTED" ? "red" : order.status === "COMPLETED" ? "gray" : "gold"}`}
                      >
                        {orderLabels[order.status]}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="btn secondary sm"
                        to={orderUrl(order.id)}
                      >
                        Xem đơn
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {!filtered.length && (
          <div className="chef-empty">
            <h3>Không có đơn phù hợp</h3>
            <p className="muted">Thử thay đổi từ khóa, ngày hoặc trạng thái.</p>
          </div>
        )}
        <div className="between">
          <span className="small muted">
            Trang {activePage + 1} / {pageCount}
          </span>
          <div className="row">
            <button
              className="btn secondary sm"
              disabled={!activePage}
              onClick={() => setPage(activePage - 1)}
            >
              Trang trước
            </button>
            <button
              className="btn secondary sm"
              disabled={activePage >= pageCount - 1}
              onClick={() => setPage(activePage + 1)}
            >
              Trang sau
            </button>
          </div>
        </div>
      </section>
    </SellerWorkspace>
  );
}
