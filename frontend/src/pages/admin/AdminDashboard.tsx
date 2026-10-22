import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight, CalendarCheck, Collection, People, PersonBadge } from "react-bootstrap-icons";
import { Link } from "react-router";
import { getAdminDashboard } from "../../clients/AdminClient";
import { useAdminCollection } from "../../hooks/useAdminCollection";

const shortcuts = [
    { to: "/admin/users", title: "Tài khoản" },
    { to: "/admin/chefs", title: "Đầu bếp" },
    { to: "/admin/menus", title: "Thực đơn" },
    { to: "/admin/dishes", title: "Món ăn" },
    { to: "/admin/categories", title: "Danh mục" },
    { to: "/admin/bookings", title: "Đơn đặt" },
    { to: "/admin/requests", title: "Yêu cầu tự tạo" },
    { to: "/admin/payments", title: "Thanh toán" },
];

type Dashboard = { userCount?: number; chefCount?: number; menuCount?: number; bookingCount?: number };
function count(value: unknown): string {
    return typeof value === "number" ? value.toLocaleString("vi-VN") : "—";
}

export default function AdminDashboard() {
    const { collection, loading: menusLoading, error: menusError } = useAdminCollection("menus", 1, "", 0);
    const [stats, setStats] = useState<Dashboard>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const controller = new AbortController();
        getAdminDashboard(controller.signal)
            .then((value) => { if (!controller.signal.aborted) setStats(value as Dashboard); })
            .catch((reason: unknown) => {
                if (axios.isAxiosError(reason) && reason.response?.status === 404) return;
                if (!controller.signal.aborted) setStats({});
            })
            .finally(() => { if (!controller.signal.aborted) setLoading(false); });
        return () => controller.abort();
    }, []);

    const metrics = [
        { title: "Người dùng", value: stats.userCount, icon: People },
        { title: "Đầu bếp", value: stats.chefCount, icon: PersonBadge },
        { title: "Thực đơn", value: stats.menuCount ?? (!menusLoading && !menusError ? collection.total ?? undefined : undefined), icon: Collection },
        { title: "Đơn đặt", value: stats.bookingCount, icon: CalendarCheck },
    ];

    return <div className="gca-page">
        <div className="gca-page-heading"><h1>Tổng quan hệ thống</h1></div>
        <div className="gca-kpi-grid">
            {metrics.map(({ title, value, icon: Icon }) => (
                <div className="gca-kpi-card" key={title}>
                    <div className="gca-kpi-top"><span>{title}</span><Icon size={19}/></div>
                    <strong>{loading && title !== "Thực đơn" ? "—" : count(value)}</strong>
                </div>
            ))}
        </div>
        <section className="gca-panel">
            <div className="gca-panel-title"><h2>Quản lý</h2></div>
            <div className="gca-quick-grid">
                {shortcuts.map(({ to, title }) => <Link className="gca-quick-item" key={to} to={to}><strong>{title}</strong><ArrowRight size={16}/></Link>)}
            </div>
        </section>
    </div>;
}
