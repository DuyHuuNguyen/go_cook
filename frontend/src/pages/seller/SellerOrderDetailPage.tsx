import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { SellerWorkspace } from "../../components/seller/SellerWorkspace";
import { useSellerDemo } from "../../contexts/SellerDemoContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import {
  displayDate,
  endTime,
  money,
  orderLabels,
  type DemoStatus,
} from "./sellerMockData";

export function SellerOrderDetailPage() {
  const [params] = useSearchParams();
  return <OrderDetail key={params.get("id")} id={params.get("id")} />;
}
function OrderDetail({ id }: { id: string | null }) {
  useDocumentTitle("Chi tiết đơn đặt nấu | GO Cook");
  const { orders, transition, addReceipts, removeReceipt, readFiles } =
    useSellerDemo();
  const order = orders.find((item) => item.id === id);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");
  const [removeId, setRemoveId] = useState("");
  const steps: DemoStatus[] = [
    "PENDING",
    "CONFIRMED",
    "PREPARING",
    "COOKING",
    "AWAITING_ACCEPTANCE",
    "COMPLETED",
  ];
  if (!order)
    return (
      <SellerWorkspace
        title="Không tìm thấy đơn"
        description="Vui lòng chọn một đơn đặt nấu trong danh sách."
      >
        <Link className="btn" to="/seller/orders">
          Về danh sách đơn
        </Link>
      </SellerWorkspace>
    );
  function advance(status: DemoStatus) {
    try {
      transition(order!.id, status, reason);
      setError("");
      setRejecting(false);
      setNotice(
        status === "AWAITING_ACCEPTANCE"
          ? "Đã báo hoàn thành. Đang chờ khách nghiệm thu, chưa ghi nhận thu nhập."
          : `Đã cập nhật: ${orderLabels[status]}.`,
      );
    } catch (err) {
      setError((err as Error).message);
    }
  }
  const receiptEditable = ["PREPARING", "COOKING"].includes(order.status);
  const currentStep = steps.indexOf(order.status);
  return (
    <SellerWorkspace
      title={`Đơn ${order.id}`}
      description={`${order.customer} · ${order.guests} khách · ${order.serviceType === "MENU" ? "Thực đơn có sẵn" : "Đặt theo ngân sách"}`}
    >
      <div className="between chef-section-heading">
        <Link className="text-link" to="/seller/orders">
          ← Tất cả đơn đặt nấu
        </Link>
        <span
          className={`badge ${order.status === "REJECTED" ? "red" : "gold"}`}
        >
          {orderLabels[order.status]}
        </span>
      </div>
      <div className="chef-demo-banner">
        <strong>Dữ liệu mẫu</strong>
        <span>Hóa đơn chỉ xem trước trên máy. Chưa kết nối API.</span>
      </div>
      {error && (
        <p role="alert" className="notice warm">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="notice">
          {notice}
        </p>
      )}
      {order.status !== "REJECTED" && (
        <ol className="chef-progress" aria-label="Tiến độ phục vụ">
          {steps.map((step, index) => (
            <li
              key={step}
              className={index <= currentStep ? "is-done" : ""}
              aria-current={step === order.status ? "step" : undefined}
            >
              <span>{index < currentStep ? "✓" : index + 1}</span>
              <small>{orderLabels[step]}</small>
            </li>
          ))}
        </ol>
      )}
      <div className="chef-detail-grid">
        <section className="card stack">
          <p className="eyebrow">Thông tin phục vụ</p>
          <h2>{order.menu}</h2>
          <dl className="chef-definitions">
            <div>
              <dt>Khách hàng</dt>
              <dd>{order.customer}</dd>
            </div>
            <div>
              <dt>Ngày nấu</dt>
              <dd>{displayDate(order.date)}</dd>
            </div>
            <div>
              <dt>Khung giờ</dt>
              <dd>
                {order.time}–{endTime(order)} · {order.duration} phút
              </dd>
            </div>
            <div>
              <dt>Số khách</dt>
              <dd>{order.guests} người</dd>
            </div>
            <div>
              <dt>Địa chỉ</dt>
              <dd>{order.area}</dd>
            </div>
          </dl>
          <div className="soft">
            <h4>Ghi chú của khách</h4>
            <p className="muted">{order.note}</p>
          </div>
          <p className="small muted">
            Nhắn tin với khách sẽ được kết nối ở giai đoạn sau.
          </p>
        </section>
        <section className="card stack">
          <p className="eyebrow">Thanh toán online</p>
          <h2>{money(order.total)}</h2>
          <span className="badge">Đã thanh toán 100%</span>
          <p className="muted">Thanh toán ngày {displayDate(order.paidAt)}</p>
          <div className="soft">
            <strong>
              {order.status === "COMPLETED"
                ? "Đã nghiệm thu · RELEASED"
                : order.status === "REJECTED"
                  ? "Chờ hoàn tiền · REFUND_PENDING"
                  : "Đang tạm giữ · HELD"}
            </strong>
            <p className="small muted">
              GO Cook 15% · Chef 85%, đã bao gồm nguyên liệu.
            </p>
          </div>
          {order.status === "COMPLETED" ? (
            <p className="green">
              <strong>Thu nhập được hưởng: {money(order.total * 0.85)}</strong>
            </p>
          ) : (
            <p className="small muted">
              {order.status === "REJECTED"
                ? "Không tính thu nhập Chef. Hoàn tiền do module Payment xử lý."
                : "Chỉ khách hàng mới được nghiệm thu. Chef không thể tự giải phóng tiền."}
            </p>
          )}
          {order.status === "PENDING" && (
            <div className="row">
              <button className="btn" onClick={() => advance("CONFIRMED")}>
                Nhận đơn
              </button>
              <button
                className="btn secondary"
                onClick={() => setRejecting(!rejecting)}
              >
                Từ chối
              </button>
            </div>
          )}
          {rejecting && (
            <form
              className="stack-sm"
              onSubmit={(e) => {
                e.preventDefault();
                advance("REJECTED");
              }}
            >
              <label className="field">
                Lý do từ chối
                <textarea
                  required
                  maxLength={1000}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
              <button className="btn secondary" disabled={!reason.trim()}>
                Xác nhận từ chối
              </button>
            </form>
          )}
          {order.status === "CONFIRMED" && (
            <button className="btn" onClick={() => advance("PREPARING")}>
              Bắt đầu chuẩn bị
            </button>
          )}
          {order.status === "PREPARING" && (
            <button className="btn" onClick={() => advance("COOKING")}>
              Bắt đầu nấu
            </button>
          )}
          {order.status === "COOKING" && (
            <button
              className="btn"
              onClick={() => advance("AWAITING_ACCEPTANCE")}
            >
              Đã nấu xong · Chờ nghiệm thu
            </button>
          )}
        </section>
      </div>
      <section className="card stack">
        <div className="between">
          <div>
            <p className="eyebrow">Minh bạch nguyên liệu</p>
            <h2>Hóa đơn mua nguyên liệu</h2>
          </div>
          <span className="badge gray">{order.receipts.length}/10 file</span>
        </div>
        <p className="muted">
          Khách hàng của đơn sẽ xem được các hóa đơn này. Chi phí nguyên liệu
          không bị trừ thêm khỏi phần thu nhập 85%.
        </p>
        {receiptEditable ? (
          <label className="chef-upload field">
            + Chọn nhiều hóa đơn
            <span className="small muted">
              JPG, PNG, WebP hoặc PDF · Tối đa 10 MB/file
            </span>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp,application/pdf"
              onChange={(e) => {
                try {
                  const files = Array.from(e.target.files || []);
                  if (order.receipts.length + files.length > 10)
                    throw new Error("Tối đa 10 hóa đơn mỗi đơn.");
                  addReceipts(order.id, readFiles(files, true));
                  setError("");
                  setNotice("Đã thêm hóa đơn mẫu.");
                } catch (err) {
                  setError((err as Error).message);
                }
                e.target.value = "";
              }}
            />
          </label>
        ) : (
          <p className="small muted">
            Chỉ thêm/xóa hóa đơn ở bước chuẩn bị hoặc đang nấu. Hóa đơn được giữ
            nguyên khi chờ nghiệm thu.
          </p>
        )}
        {!order.receipts.length && (
          <div className="soft">Chưa có hóa đơn nguyên liệu cho đơn này.</div>
        )}
        <div className="chef-image-grid">
          {order.receipts.map((file) => (
            <article className="chef-image-tile" key={file.id}>
              {file.type === "application/pdf" ? (
                <div className="chef-pdf-mark">PDF</div>
              ) : (
                <a href={file.url} target="_blank" rel="noreferrer">
                  <img src={file.url} alt={file.name} />
                </a>
              )}
              <strong className="small chef-filename">{file.name}</strong>
              <a
                className="text-link small"
                href={file.url}
                target="_blank"
                rel="noreferrer"
              >
                Mở hóa đơn ↗
              </a>
              {receiptEditable && (
                <button
                  className="btn ghost sm"
                  onClick={() => setRemoveId(file.id)}
                >
                  Xóa
                </button>
              )}
              {removeId === file.id && (
                <div className="stack-sm">
                  <p className="small">Xóa hóa đơn này?</p>
                  <div className="row">
                    <button
                      className="btn secondary sm"
                      onClick={() => {
                        try {
                          removeReceipt(order.id, file.id);
                          setRemoveId("");
                        } catch (err) {
                          setError((err as Error).message);
                        }
                      }}
                    >
                      Xác nhận
                    </button>
                    <button
                      className="btn ghost sm"
                      onClick={() => setRemoveId("")}
                    >
                      Giữ lại
                    </button>
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      </section>
      <section className="card stack">
        <h2>Lịch sử trạng thái</h2>
        <ol className="chef-history">
          {order.history.map((event, index) => (
            <li key={index}>
              <strong>{orderLabels[event.status]}</strong>
              <span className="small muted">
                {new Date(event.at).toLocaleString("vi-VN", {
                  timeZone: "Asia/Ho_Chi_Minh",
                })}
              </span>
              {event.note && <p className="small muted">{event.note}</p>}
            </li>
          ))}
        </ol>
      </section>
    </SellerWorkspace>
  );
}
