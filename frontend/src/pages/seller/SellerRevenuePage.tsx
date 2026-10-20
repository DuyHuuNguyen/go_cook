import { useState } from "react";
import { SellerWorkspace } from "../../components/seller/SellerWorkspace";
import { useSellerDemo } from "../../contexts/SellerDemoContext";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { money, summarizeRevenue } from "./sellerMockData";

export function SellerRevenuePage() {
  useDocumentTitle("Doanh thu | GO Cook");
  const { orders } = useSellerDemo();
  const [from, setFrom] = useState("2026-08-01");
  const [to, setTo] = useState("2026-10-31");
  const monthSpan =
    (Number(to.slice(0, 4)) - Number(from.slice(0, 4))) * 12 +
    Number(to.slice(5, 7)) -
    Number(from.slice(5, 7));
  const valid = !!from && !!to && from <= to && monthSpan < 36;
  const summary = summarizeRevenue(valid ? orders : [], from, to);
  const months: { label: string; income: number }[] = [];
  if (valid)
    for (let index = 0; index <= monthSpan; index++) {
      const date = new Date(
        Date.UTC(
          Number(from.slice(0, 4)),
          Number(from.slice(5, 7)) - 1 + index,
          1,
        ),
      );
      const key = date.toISOString().slice(0, 7);
      months.push({
        label: `${key.slice(5)}/${key.slice(0, 4)}`,
        income: summary.released
          .filter((order) => order.releasedAt?.startsWith(key))
          .reduce((sum, order) => sum + summary.share(order), 0),
      });
    }
  const maxIncome = Math.max(1, ...months.map((month) => month.income));
  const total = summary.menuCount + summary.budgetCount;
  const menuPercent = total ? Math.round((summary.menuCount / total) * 100) : 0;
  return (
    <SellerWorkspace
      title="Doanh thu"
      description="Rõ từng khoản tạm giữ, đúng phần thu nhập bạn được hưởng."
    >
      <div className="chef-demo-banner">
        <strong>Dữ liệu mẫu · VND</strong>
        <span>Thu nhập chỉ ghi nhận sau khi khách nghiệm thu.</span>
      </div>
      <section className="card stack-sm">
        <div className="chef-filters">
          <label className="field">
            Từ ngày
            <input
              required
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </label>
          <label className="field">
            Đến ngày
            <input
              required
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </label>
          <div className="field">
            <span>Chọn nhanh</span>
            <button
              className="btn secondary"
              onClick={() => {
                setFrom("2026-10-01");
                setTo("2026-10-31");
              }}
            >
              Tháng 10/2026
            </button>
          </div>
          <div className="field">
            <span>&nbsp;</span>
            <button
              className="btn secondary"
              onClick={() => {
                setFrom("2026-08-01");
                setTo("2026-10-31");
              }}
            >
              3 tháng mẫu
            </button>
          </div>
        </div>
        {!valid && (
          <p className="danger" role="alert">
            Chọn đủ ngày, từ ngày không sau đến ngày, tối đa 36 tháng.
          </p>
        )}
        <p className="small muted">
          Đã thanh toán và tạm giữ: lọc theo ngày nhận tiền. Thu nhập và cột:
          lọc theo ngày khách nghiệm thu. Múi giờ Việt Nam.
        </p>
      </section>
      <div className="grid grid-3 chef-revenue-metrics">
        {[
          [
            "Giá trị đơn đã thanh toán",
            summary.paid,
            "Tổng giá trị đơn HELD + RELEASED trong kỳ thanh toán.",
          ],
          [
            "Tiền đang tạm giữ",
            summary.held,
            "Các đơn thanh toán trong kỳ hiện còn HELD.",
          ],
          [
            "Thu nhập được hưởng",
            summary.earned,
            "85% từ các đơn nghiệm thu trong kỳ.",
          ],
        ].map(([title, value, hint]) => (
          <article className="card chef-metric" key={title}>
            <p className="small muted">{title}</p>
            <strong className="chef-metric-value">
              {money(Number(value))}
            </strong>
            <p className="small muted">{hint}</p>
          </article>
        ))}
      </div>
      <section className="card stack">
        <div>
          <p className="eyebrow">Thu nhập sau nghiệm thu</p>
          <h2>Thu nhập Chef theo tháng</h2>
          <p className="small muted">
            85% giá trị đơn · Không trừ thêm nguyên liệu · Tháng không có thu
            nhập hiển thị 0đ
          </p>
        </div>
        <div className="chef-chart-scroll">
          <div
            className="chef-bars"
            role="img"
            aria-label={`Thu nhập theo tháng: ${months.map((month) => `${month.label}: ${money(month.income)}`).join("; ") || "Không có dữ liệu"}`}
          >
            {months.map((month) => (
              <div className="chef-bar-column" key={month.label}>
                <strong className="small">{money(month.income)}</strong>
                <div className="chef-bar-track">
                  <div
                    className="chef-bar-fill"
                    style={{ height: `${(month.income / maxIncome) * 100}%` }}
                  />
                </div>
                <span className="small muted">{month.label}</span>
              </div>
            ))}
          </div>
        </div>
        {!summary.released.length && (
          <p className="muted">
            Chưa có đơn được nghiệm thu trong khoảng ngày đã chọn.
          </p>
        )}
      </section>
      <section className="card stack">
        <div>
          <p className="eyebrow">Cơ cấu đơn đã thanh toán</p>
          <h2>Thực đơn có sẵn & theo ngân sách</h2>
          <p className="small muted">
            Theo số lượng đơn HELD/RELEASED có ngày thanh toán trong kỳ; loại
            đơn chờ hoàn/đã hoàn tiền.
          </p>
        </div>
        <div className="chef-pie-layout">
          <div
            className="chef-pie"
            role="img"
            aria-label={
              total
                ? `MENU ${summary.menuCount} đơn, BUDGET ${summary.budgetCount} đơn`
                : "Chưa có đơn đã thanh toán trong kỳ"
            }
            style={{
              background: total
                ? `conic-gradient(var(--brand) 0 ${menuPercent}%, #d6b773 ${menuPercent}% 100%)`
                : "var(--line)",
            }}
          >
            <div>
              <strong>{total}</strong>
              <span className="small muted">đơn đã thanh toán</span>
            </div>
          </div>
          <div className="stack">
            <div className="chef-legend">
              <span className="chef-dot" />
              <div>
                <strong>Thực đơn có sẵn · MENU</strong>
                <p className="muted">
                  {summary.menuCount} đơn · {menuPercent}%
                </p>
              </div>
            </div>
            <div className="chef-legend">
              <span className="chef-dot budget" />
              <div>
                <strong>Theo ngân sách · BUDGET</strong>
                <p className="muted">
                  {summary.budgetCount} đơn · {total ? 100 - menuPercent : 0}%
                </p>
              </div>
            </div>
            {!total && <p className="muted">Chưa có dữ liệu trong kỳ.</p>}
          </div>
        </div>
      </section>
    </SellerWorkspace>
  );
}
