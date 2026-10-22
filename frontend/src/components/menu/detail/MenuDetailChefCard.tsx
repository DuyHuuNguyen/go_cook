import type { CatalogMenu } from '../../home/catalogData';

interface MenuDetailChefCardProps {
    menu: CatalogMenu;
}

export default function MenuDetailChefCard({ menu }: MenuDetailChefCardProps) {
    return (
        <div className="mdd-chef-card">
            <div className="mdd-chef-avatar-wrap">
                <img
                    src="https://i.pravatar.cc/150?img=32"
                    alt={`Đầu bếp ${menu.chefName}`}
                    className="mdd-chef-avatar"
                />
                <span className="mdd-chef-verified">
                    <i className="fa-solid fa-check" />
                </span>
            </div>
            <div className="mdd-chef-info">
                <div className="mdd-chef-name-row">
                    <h3>{menu.chefName}</h3>
                    <span className="mdd-chef-badge">Bếp 5 Sao</span>
                </div>
                <div className="mdd-chef-stats">
                    <span className="mdd-chef-rating">
                        <i className="fa-solid fa-star" /> 5.0
                    </span>
                    <span className="mdd-chef-reviews">(128 đánh giá)</span>
                    <span className="mdd-chef-dot" />
                    <span>330+ tiệc tại gia hoàn tất</span>
                </div>
            </div>
            <button className="mdd-chef-profile-btn" type="button">
                Xem hồ sơ đầu bếp
            </button>
        </div>
    );
}
