import { Link } from 'react-router';

interface MenuDetailBreadcrumbProps {
    categoryName: string;
    menuName: string;
}

export default function MenuDetailBreadcrumb({ categoryName, menuName }: MenuDetailBreadcrumbProps) {
    return (
        <nav className="mdd-breadcrumb" aria-label="Điều hướng">
            <Link to="/">
                <i className="fa-solid fa-house" />
                Trang chủ
            </Link>
            <i className="fa-solid fa-chevron-right mdd-breadcrumb-sep" />
            <Link to="/menus">Thực đơn</Link>
            <i className="fa-solid fa-chevron-right mdd-breadcrumb-sep" />
            <Link to={`/menus?category=${encodeURIComponent(categoryName)}`}>{categoryName}</Link>
            <i className="fa-solid fa-chevron-right mdd-breadcrumb-sep" />
            <span aria-current="page">{menuName}</span>
        </nav>
    );
}
