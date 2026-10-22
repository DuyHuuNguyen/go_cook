import { People, ArrowRight, Eye } from 'react-bootstrap-icons';
import type { CatalogMenu } from '../home/catalogData';
import { displayPrice } from '../home/catalogData';

interface MenuCardProps {
    menu: CatalogMenu;
    onSelect: (menu: CatalogMenu) => void;
}

export default function MenuCard({ menu, onSelect }: MenuCardProps) {
    return (
        <article className="gcp-menu-card">
            <div className="gcp-card-cover">
                <img
                    src={menu.imageUrl || '/images/menus/fallback.svg'}
                    alt={menu.name}
                    loading="lazy"
                    onError={(event) => { event.currentTarget.src = '/images/menus/fallback.svg'; }}
                />
                <span className="gcp-card-label">{menu.categoryName}</span>
            </div>
            <div className="gcp-card-body">
                <div className="gcp-card-meta">
                    <span><People size={15} /> {menu.minGuests}–{menu.maxGuests} người</span>
                    <span>{menu.chefName}</span>
                </div>
                <h3>{menu.name}</h3>
                {menu.description && <p className="gcp-card-description">{menu.description}</p>}
                <div className="gcp-dish-box">
                    <strong>TRONG THỰC ĐƠN</strong>
                    {menu.dishes?.length ? (
                        <ul>{menu.dishes.slice(0, 5).map((dish) => <li key={dish}>{dish}</li>)}</ul>
                    ) : (
                        <p>Xem chi tiết để biết thêm về thực đơn này.</p>
                    )}
                </div>
                <div className="gcp-card-price">
                    <span>Giá tham khảo</span>
                    <strong>{displayPrice(menu.referencePrice)}</strong>
                </div>
                <div className="gcp-card-actions">
                    <button className="gcp-btn gcp-btn-light" type="button" onClick={() => onSelect(menu)}>
                        <Eye size={15} /> Xem chi tiết
                    </button>
                    <button className="gcp-btn gcp-btn-primary" type="button" onClick={() => onSelect(menu)}>
                        Chọn thực đơn <ArrowRight size={15} />
                    </button>
                </div>
            </div>
        </article>
    );
}
