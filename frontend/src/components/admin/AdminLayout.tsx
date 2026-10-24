import { useEffect, useState } from "react";
import { Link, NavLink, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import {
    BarChart, BoxArrowUpRight, CalendarCheck, CardChecklist,
    ChatDots, ChevronDown, Collection, CreditCard, EggFried,
    Gear, Grid1x2, List, People, PersonBadge, Search, ShieldCheck, XLg,
} from "react-bootstrap-icons";
import { useProfile } from "../../contexts/ProfileContext";
import logo from "../../assets/go-cook-logo.svg";
import "../../styles/admin.css";

const navigation = [
    {
        heading: "TỔNG QUAN",
        items: [{ href: "/admin", text: "Bảng điều khiển", icon: Grid1x2, exact: true }],
    },
    {
        heading: "VẬN HÀNH",
        items: [
            { href: "/admin/users", text: "Tài khoản", icon: People },
            { href: "/admin/chefs", text: "Đầu bếp", icon: PersonBadge },
            { href: "/admin/menus", text: "Thực đơn", icon: Collection },
            { href: "/admin/dishes", text: "Món ăn", icon: EggFried },
            { href: "/admin/categories", text: "Danh mục", icon: CardChecklist },
        ],
    },
    {
        heading: "ĐƠN HÀNG & TÀI CHÍNH",
        items: [
            { href: "/admin/bookings", text: "Đơn đặt", icon: CalendarCheck },
            { href: "/admin/requests", text: "Yêu cầu tự tạo", icon: CardChecklist },
            { href: "/admin/payments", text: "Thanh toán", icon: CreditCard },
        ],
    },
    {
        heading: "HỆ THỐNG",
        items: [
            { href: "/admin/feedback", text: "Phản ánh & hỗ trợ", icon: ChatDots },
            { href: "/admin/reports", text: "Báo cáo", icon: BarChart },
            { href: "/admin/settings", text: "Cài đặt", icon: Gear },
        ],
    },
];

function AdminFrame() {
    const location = useLocation();
    const navigate = useNavigate();
    const { profileData } = useProfile();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [siteSearch, setSiteSearch] = useState("");

    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    const activeItem = navigation.flatMap((section) => section.items).find(
        (item) => location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(`${item.href}/`))
    );

    return (
        <div className="gca-root">
            {sidebarOpen && <button className="gca-backdrop" aria-label="Đóng điều hướng" onClick={() => setSidebarOpen(false)} />}
            <aside className={`gca-sidebar${sidebarOpen ? " is-open" : ""}`}>
                <div className="gca-sidebar-header">
                    <Link className="gca-brand" to="/admin" aria-label="GoCook Admin - Trang tổng quan">
                        <img src={logo} alt="GO Cook" />
                        <span className="gca-brand-caption">TRUNG TÂM QUẢN TRỊ</span>
                    </Link>
                    <button className="gca-menu-close" onClick={() => setSidebarOpen(false)} aria-label="Đóng menu"><XLg /></button>
                </div>
                <div className="gca-workspace">
                    <div className="gca-workspace-symbol"><ShieldCheck /></div>
                    <div><strong>GoCook Admin</strong><span>Quản lý hệ thống</span></div>
                    <ChevronDown size={13} />
                </div>
                <nav className="gca-navigation" aria-label="Điều hướng quản trị">
                    {navigation.map((section) => (
                        <div className="gca-nav-section" key={section.heading}>
                            <div className="gca-nav-heading">{section.heading}</div>
                            {section.items.map(({ href, text, icon: Icon }) => (
                                <NavLink key={href} to={href} end className={({ isActive }) =>
                                    `gca-nav-link${isActive ? " is-active" : ""}`
                                }>
                                    <Icon size={18} /><span>{text}</span>
                                </NavLink>
                            ))}
                        </div>
                    ))}
                </nav>
                <div className="gca-sidebar-footer">
                    <Link to="/" className="gca-return-link">Về trang GoCook <BoxArrowUpRight size={14} /></Link>
                </div>
            </aside>

            <div className="gca-main">
                <header className="gca-topbar">
                    <div className="gca-top-left">
                        <button className="gca-icon-button gca-mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Mở menu"><List size={24} /></button>
                        <div className="gca-breadcrumb"><span>Quản trị</span><span className="gca-breadcrumb-separator">/</span><strong>{activeItem?.text || "Bảng điều khiển"}</strong></div>
                    </div>
                    <div className="gca-top-actions">
                        {searchOpen ? (
                            <form className="gca-quick-search" onSubmit={(event) => {
                                event.preventDefault();
                                if (siteSearch.trim()) navigate(`/admin/menus?q=${encodeURIComponent(siteSearch.trim())}`);
                            }}>
                                <Search size={15} />
                                <input aria-label="Tìm thực đơn" autoFocus value={siteSearch} onChange={(event) => setSiteSearch(event.target.value)} placeholder="Tìm thực đơn..." />
                                <button type="button" onClick={() => setSearchOpen(false)} aria-label="Đóng tìm kiếm"><XLg size={14} /></button>
                            </form>
                        ) : (
                            <button className="gca-icon-button" onClick={() => setSearchOpen(true)} aria-label="Tìm kiếm thực đơn"><Search size={19} /></button>
                        )}
                        <div className="gca-account"><span className="gca-account-avatar">{(profileData?.username || "A").charAt(0).toUpperCase()}</span><span><strong>{profileData?.username || "Quản trị viên"}</strong><small>System Admin</small></span></div>
                    </div>
                </header>
                <main className="gca-content"><Outlet /></main>
                
            </div>
        </div>
    );
}

export default function AdminLayout() {
    const { profileData, loading, error, fetchProfile } = useProfile();
    useEffect(() => {
        void fetchProfile();
    }, [fetchProfile]);

    if (loading) return <div className="gca-auth-message">Đang kiểm tra quyền truy cập...</div>;
    if (!profileData && error) return <div className="gca-auth-message" role="alert">{error} <button type="button" onClick={() => void fetchProfile()}>Thử lại</button></div>;
    if (!profileData) return <Navigate to="/login" replace />;
    if (!profileData.roles?.includes("ROLE_SYSTEM_ADMIN")) {
        return <div className="gca-auth-message" role="alert">Bạn không có quyền truy cập. <Link to="/">Về trang chủ</Link></div>;
    }
    return <AdminFrame />;
}
