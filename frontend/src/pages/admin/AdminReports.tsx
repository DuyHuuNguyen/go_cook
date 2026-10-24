import { useEffect, useState } from "react";
import axios from "axios";
import { getAdminReports } from "../../clients/AdminClient";
import AdminState from "../../components/admin/AdminState";

type Report = {
    revenue?: number;
    completedBookings?: number;
    completionRate?: number;
    averageOrderValue?: number;
    revenueByDay?: Array<{ date: string; revenue: number }>;
    bookingsByStatus?: Array<{ status: string; count: number }>;
};

function metric(value: number | undefined, type: "money" | "percent" | "count"): string {
    if (typeof value !== "number") return "—";
    if (type === "money") return `${value.toLocaleString("vi-VN")} đ`;
    if (type === "percent") return `${value.toLocaleString("vi-VN")}%`;
    return value.toLocaleString("vi-VN");
}

export default function AdminReports() {
    const [days, setDays] = useState(30);
    const [report, setReport] = useState<Report>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [refresh, setRefresh] = useState(0);

    useEffect(() => {
        const controller = new AbortController();
        setLoading(true);
        setError("");
        getAdminReports(days, controller.signal)
            .then((data) => { if (!controller.signal.aborted) setReport(data as Report); })
            .catch((reason: unknown) => {
                if (controller.signal.aborted) return;
                setReport({});
                if (!(axios.isAxiosError(reason) && reason.response?.status === 404)) setError("Không thể tải báo cáo.");
            })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, [days, refresh]);

    const metrics = [
        { label: "Doanh thu", value: metric(report.revenue, "money") },
        { label: "Đơn hoàn tất", value: metric(report.completedBookings, "count") },
        { label: "Tỷ lệ hoàn thành", value: metric(report.completionRate, "percent") },
        { label: "Giá trị đơn trung bình", value: metric(report.averageOrderValue, "money") },
    ];

    return <div className="gca-page">
        <div className="gca-page-heading"><h1>Báo cáo, thống kê</h1><select className="gca-simple-select" aria-label="Khoảng thời gian" value={days} onChange={(event) => setDays(Number(event.target.value))}><option value={7}>7 ngày</option><option value={30}>30 ngày</option><option value={90}>90 ngày</option><option value={365}>12 tháng</option></select></div>
        <div className="gca-kpi-grid">{metrics.map(({ label, value }) => <div key={label} className="gca-kpi-card"><div className="gca-kpi-top"><span>{label}</span></div><strong>{loading ? "—" : value}</strong></div>)}</div>
        <div className="gca-report-grid">
            <section className="gca-panel"><div className="gca-panel-title"><h2>Doanh thu theo ngày</h2></div>
                {loading || error || !report.revenueByDay?.length ? <AdminState type={loading ? "loading" : error ? "error" : "empty"} message={error} retry={() => setRefresh((n) => n + 1)}/> :
                    <div className="gca-table-wrap"><table className="gca-table"><thead><tr><th>Ngày</th><th>Doanh thu</th></tr></thead><tbody>{report.revenueByDay.map((item) => <tr key={item.date}><td>{item.date}</td><td>{metric(item.revenue, "money")}</td></tr>)}</tbody></table></div>}
            </section>
            <section className="gca-panel"><div className="gca-panel-title"><h2>Trạng thái đơn</h2></div>
                {loading || error || !report.bookingsByStatus?.length ? <AdminState type={loading ? "loading" : error ? "error" : "empty"} message={error} retry={() => setRefresh((n) => n + 1)}/> :
                    <div className="gca-table-wrap"><table className="gca-table"><thead><tr><th>Trạng thái</th><th>Số đơn</th></tr></thead><tbody>{report.bookingsByStatus.map((item) => <tr key={item.status}><td>{item.status}</td><td>{metric(item.count, "count")}</td></tr>)}</tbody></table></div>}
            </section>
        </div>
    </div>;
}
