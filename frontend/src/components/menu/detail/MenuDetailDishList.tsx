import type { CatalogMenu } from '../../home/catalogData';

interface MenuDetailDishListProps {
    menu: CatalogMenu;
}

const DISH_IMAGES = [
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1627308595229-7830f5c90683?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1604152135912-04a022e23696?auto=format&fit=crop&q=80&w=200',
    'https://images.unsplash.com/photo-1625938144755-652e08e359b7?auto=format&fit=crop&q=80&w=200',
];

const DISH_CATEGORIES = ['Món canh', 'Món mặn', 'Món xào', 'Món luộc'];

const CATEGORY_STYLES: Record<string, string> = {
    'Món canh': 'mdd-dish-cat mdd-dish-cat--default',
    'Món mặn': 'mdd-dish-cat mdd-dish-cat--orange',
    'Món xào': 'mdd-dish-cat mdd-dish-cat--default',
    'Món luộc': 'mdd-dish-cat mdd-dish-cat--default',
};

export default function MenuDetailDishList({ menu }: MenuDetailDishListProps) {
    const dishes = menu.dishes ?? [];
    const servingLabel = `${menu.minGuests}–${menu.maxGuests} người`;

    return (
        <div className="mdd-section">
            <div className="mdd-dish-header">
                <h3>
                    <i className="fa-solid fa-list-check mdd-icon-green" />
                    Danh sách {dishes.length > 0 ? dishes.length : ''} món trong mâm cơm
                </h3>
                <span className="mdd-badge-green">Định lượng {servingLabel}</span>
            </div>

            <div className="mdd-dish-list">
                {dishes.length === 0 ? (
                    <p className="mdd-no-dishes">Thông tin các món ăn sẽ được cập nhật sớm.</p>
                ) : (
                    dishes.map((dish, index) => (
                        <div className="mdd-dish-item" key={index}>
                            <img
                                src={DISH_IMAGES[index % DISH_IMAGES.length]}
                                alt={dish}
                                onError={(e) => { e.currentTarget.src = '/images/menus/fallback.svg'; }}
                            />
                            <div className="mdd-dish-content">
                                <div>
                                    <div className="mdd-dish-title-row">
                                        <h4>{index + 1}. {dish}</h4>
                                    </div>
                                    <p className="mdd-dish-desc">Nguyên liệu tươi sống, được chọn lựa kỹ càng và chế biến theo công thức truyền thống.</p>
                                </div>
                                <div className="mdd-dish-tags">
                                    <span><i className="fa-regular fa-circle-check mdd-icon-green" /> Nguyên liệu tươi sống</span>
                                    <span><i className="fa-regular fa-circle-check mdd-icon-green" /> Nấu tại nhà</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Freebies */}
            <div className="mdd-freebies">
                <div className="mdd-freebies-icon">
                    <i className="fa-solid fa-gift" />
                </div>
                <div>
                    <h4>Món kèm miễn phí trong gói</h4>
                    <p>Cơm trắng dẻo thơm nấu trực tiếp tại chỗ nóng hổi + Trà đá mát lạnh tráng miệng sau bữa.</p>
                </div>
            </div>
        </div>
    );
}
