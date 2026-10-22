import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { Container } from 'react-bootstrap';
import { useCatalog } from '../hooks/useCatalog';
import type { CatalogMenu } from '../components/home/catalogData';
import MenuDetailBreadcrumb from '../components/menu/detail/MenuDetailBreadcrumb';
import MenuDetailHero from '../components/menu/detail/MenuDetailHero';
import MenuDetailChefCard from '../components/menu/detail/MenuDetailChefCard';
import MenuDetailDishList from '../components/menu/detail/MenuDetailDishList';
import MenuDetailServiceStandards from '../components/menu/detail/MenuDetailServiceStandards';
import MenuDetailNotes from '../components/menu/detail/MenuDetailNotes';
import MenuDetailComments from '../components/menu/detail/MenuDetailComments';
import MenuDetailBookingWidget from '../components/menu/detail/MenuDetailBookingWidget';
import MenuDetailRelated from '../components/menu/detail/MenuDetailRelated';
import '../styles/menuPages.css';
import '../styles/menuDetail.css';

export default function MenuDetailPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const catalog = useCatalog();
    const [menu, setMenu] = useState<CatalogMenu | null>(null);
    const [relatedMenus, setRelatedMenus] = useState<CatalogMenu[]>([]);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        if (catalog.loading) return;
        const menuId = Number(id);
        const found = catalog.menus.find((m: CatalogMenu) => m.id === menuId);
        if (!found) {
            navigate('/menus', { replace: true });
            return;
        }
        setMenu(found);
        setRelatedMenus(catalog.menus.filter((m: CatalogMenu) => m.id !== menuId).slice(0, 3));
    }, [id, catalog.loading, catalog.menus, navigate]);

    if (catalog.loading) {
        return (
            <div className="mdd-page gcp-page">
                <Container>
                    <div className="mdd-loading" role="status">
                        <div className="mdd-loading-spinner" />
                        <p>Đang tải thực đơn...</p>
                    </div>
                </Container>
            </div>
        );
    }

    if (catalog.error) {
        return (
            <div className="mdd-page gcp-page">
                <Container>
                    <div className="mdd-error" role="alert">
                        <i className="fa-solid fa-triangle-exclamation" />
                        <h2>Không thể tải thực đơn</h2>
                        <p>Máy chủ đang gặp sự cố. Vui lòng thử lại sau.</p>
                        <button type="button" className="gcp-btn gcp-btn-primary" onClick={catalog.retry}>
                            Thử lại
                        </button>
                        <Link to="/menus" className="gcp-btn gcp-btn-light">Về danh sách thực đơn</Link>
                    </div>
                </Container>
            </div>
        );
    }

    if (!menu) return null;

    const menuTags = [
        { icon: 'fa-solid fa-leaf', label: `Khẩu vị ${menu.categoryName}`, style: 'mdd-tag mdd-tag--green' },
        { icon: 'fa-solid fa-users', label: `Gia đình ${menu.minGuests}–${menu.maxGuests} người`, style: 'mdd-tag mdd-tag--green' },
        { icon: 'fa-solid fa-bowl-food', label: 'Chuẩn Vị Truyền Thống', style: 'mdd-tag mdd-tag--orange' },
    ];

    return (
        <div className="mdd-page gcp-page">
            <Container>
                <MenuDetailBreadcrumb categoryName={menu.categoryName} menuName={menu.name} />
    
                <div className="mdd-title-section">
                    <div className="mdd-tags">
                        {menuTags.map((tag, i) => (
                            <span key={i} className={tag.style}>
                                <i className={tag.icon} /> {tag.label}
                            </span>
                        ))}
                    </div>
                    <div className="mdd-title-row">
                        <h1>{menu.name}</h1>
                        <div className="mdd-title-actions">
                            <button
                                type="button"
                                className={`mdd-action-btn ${saved ? 'mdd-action-btn--saved' : ''}`}
                                onClick={() => setSaved((v) => !v)}
                                aria-label={saved ? 'Đã lưu' : 'Lưu thực đơn'}
                            >
                                <i className={saved ? 'bi bi-heart-fill' : 'bi bi-heart'} />
                                {saved ? 'Đã lưu' : 'Lưu thực đơn'}
                            </button>
                            <button type="button" className="mdd-action-btn" aria-label="Chia sẻ">
                                <i className="fa-solid fa-share-nodes" /> Chia sẻ
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Gallery */}
                <MenuDetailHero menu={menu} />

                {/* Two-column layout */}
                <div className="mdd-two-col">
                    {/* Left: Detail content */}
                    <div className="mdd-left-col">
                        <MenuDetailChefCard menu={menu} />

                        {/* Description */}
                        <div className="mdd-section">
                            <h3>
                                <i className="fa-solid fa-utensils mdd-icon-green" /> Giới thiệu thực đơn
                            </h3>
                            <p className="mdd-description">
                                {menu.description ?? 'Bữa cơm mang đầy hương vị truyền thống, kết hợp hài hòa các món ăn đặc trưng, mang lại cảm giác sum họp ấm cúng cho cả gia đình sau ngày dài bận rộn. Mọi nguyên liệu đều được chọn lựa kỹ càng, giữ trọn độ tươi sống.'}
                            </p>
                            <div className="mdd-feature-grid">
                                <div>
                                    <p className="mdd-feature-label">Hương vị</p>
                                    <p className="mdd-feature-value">Đậm đà truyền thống</p>
                                </div>
                                <div>
                                    <p className="mdd-feature-label">Phù hợp</p>
                                    <p className="mdd-feature-value">Bữa trưa &amp; Tối</p>
                                </div>
                                <div>
                                    <p className="mdd-feature-label">Dụng cụ nấu</p>
                                    <p className="mdd-feature-value">Đầu bếp mang theo</p>
                                </div>
                                <div>
                                    <p className="mdd-feature-label">Thời gian dọn</p>
                                    <p className="mdd-feature-value">Bao gồm trọn gói</p>
                                </div>
                            </div>
                        </div>

                        <MenuDetailDishList menu={menu} />
                        <MenuDetailServiceStandards />
                        <MenuDetailNotes />
                        <MenuDetailComments />
                    </div>

                    {/* Right: Booking widget */}
                    <div className="mdd-right-col">
                        <div className="mdd-booking-sticky">
                            <MenuDetailBookingWidget menu={menu} />
                        </div>
                    </div>
                </div>

                {/* Related menus */}
                <MenuDetailRelated menus={relatedMenus} />
            </Container>
        </div>
    );
}
