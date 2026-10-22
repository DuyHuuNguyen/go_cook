import { Link } from 'react-router';
import type { CatalogMenu } from '../../home/catalogData';
import { displayPrice } from '../../home/catalogData';

interface MenuDetailRelatedProps {
    menus: CatalogMenu[];
}

const RELATED_REGION_LABELS: Record<string, string> = {
    'Miền Nam': 'Miền Tây Sông Nước',
    'Miền Trung': 'Bản Sắc Miền Trung',
    'Miền Bắc': 'Thanh Vị Bắc Bộ',
};

const RELATED_IMAGES = [
    'https://images.unsplash.com/photo-1628294895950-9805252327bc?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1511910849309-0dffb8785146?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1543363363-22877cc1bfb9?auto=format&fit=crop&q=80&w=600',
];

export default function MenuDetailRelated({ menus }: MenuDetailRelatedProps) {
    if (menus.length === 0) return null;

    return (
        <div className="mdd-related">
            <div className="mdd-related-header">
                <div>
                    <span className="mdd-related-kicker">Khám phá phong vị</span>
                    <h2>Thực đơn cùng phong cách được yêu thích khác</h2>
                </div>
                <Link to="/menus" className="mdd-related-see-all">
                    Xem tất cả mâm cơm <i className="fa-solid fa-arrow-right-long" />
                </Link>
            </div>

            <div className="mdd-related-grid">
                {menus.slice(0, 3).map((menu, index) => {
                    const regionLabel = RELATED_REGION_LABELS[menu.categoryName] ?? menu.categoryName;
                    const imgSrc = menu.imageUrl || RELATED_IMAGES[index % RELATED_IMAGES.length];
                    return (
                        <div className="mdd-related-card" key={menu.id}>
                            <div className="mdd-related-img-wrap">
                                <img
                                    src={imgSrc}
                                    alt={menu.name}
                                    onError={(e) => { e.currentTarget.src = RELATED_IMAGES[index % RELATED_IMAGES.length]; }}
                                />
                                <span className="mdd-related-region-label">{regionLabel}</span>
                            </div>
                            <div className="mdd-related-body">
                                <div className="mdd-related-meta">
                                    <span className="mdd-related-rating">
                                        <i className="fa-solid fa-star" /> 4.9 (100+)
                                    </span>
                                    <span>
                                        <i className="fa-regular fa-clock" /> 60–90 phút
                                    </span>
                                </div>
                                <h3>{menu.name}</h3>
                                <p className="mdd-related-desc">{menu.description ?? 'Thực đơn phục vụ tại gia.'}</p>
                                <div className="mdd-related-footer">
                                    <div>
                                        <span className="mdd-related-price">{displayPrice(menu.referencePrice)}</span>
                                        <span className="mdd-related-per"> / người</span>
                                    </div>
                                    <Link to={`/menus/${menu.id}`} className="mdd-related-btn">
                                        Xem thực đơn
                                    </Link>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Mobile see-all link */}
            <div className="mdd-related-mobile-link">
                <Link to="/menus">
                    Xem tất cả mâm cơm <i className="fa-solid fa-arrow-right-long" />
                </Link>
            </div>
        </div>
    );
}
