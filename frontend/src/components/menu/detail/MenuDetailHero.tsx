import type { CatalogMenu } from '../../home/catalogData';
import { displayPrice } from '../../home/catalogData';

interface MenuDetailHeroProps {
    menu: CatalogMenu;
}

const FALLBACK_SIDE_IMAGES = [
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=500',
    'https://images.unsplash.com/photo-1627308595229-7830f5c90683?auto=format&fit=crop&q=80&w=500',
];

export default function MenuDetailHero({ menu }: MenuDetailHeroProps) {
    const mainImage = menu.imageUrl || 'https://images.unsplash.com/photo-1555126634-323283e090fa?auto=format&fit=crop&q=80&w=1000';

    return (
        <div className="mdd-gallery">
            {/* Main image */}
            <div className="mdd-gallery-main">
                <img
                    src={mainImage}
                    alt={menu.name}
                    onError={(e) => { e.currentTarget.src = '/images/menus/fallback.svg'; }}
                />
                <div className="mdd-gallery-main-overlay" />
                <div className="mdd-gallery-main-info">
                    <div>
                        <span className="mdd-gallery-badge">Món chính</span>
                        <h2>{menu.name}</h2>
                        <p>{menu.description || 'Thực đơn phục vụ tại gia chuyên nghiệp'}</p>
                    </div>
                </div>
            </div>

            {/* Side images */}
            <div className="mdd-gallery-side">
                {FALLBACK_SIDE_IMAGES.map((src, index) => (
                    <div className="mdd-gallery-side-item" key={index}>
                        <img src={src} alt={`Ảnh minh họa ${index + 1}`} />
                        <div className="mdd-gallery-side-overlay" />
                        <span className="mdd-gallery-side-label">
                            {menu.dishes?.[index] ?? `Món ${index + 1}`}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
