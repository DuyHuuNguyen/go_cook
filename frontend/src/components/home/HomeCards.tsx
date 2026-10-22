import { ArrowUpRight, People, StarFill } from 'react-bootstrap-icons';
import type { HomeChef, HomeMenu } from '../../types/HomeTypes';

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(price);
}

interface MenuCardProps {
  menu: HomeMenu;
  onSelect: (menu: HomeMenu) => void;
}

export function MenuCard({ menu, onSelect }: MenuCardProps) {
  return (
    <button type="button" className="gc-menu-card" onClick={() => onSelect(menu)}
      aria-label={`Xem chi tiết ${menu.name}`}>
      <div className="gc-menu-card-image-wrap">
        <img src={menu.imageUrl || '/assets/meal.png'} alt={menu.name} loading="lazy"
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/assets/meal.png'; }} />
        <span className="gc-menu-category">{menu.categoryName}</span>
      </div>
      <div className="gc-menu-card-body">
        <div className="gc-menu-card-topline"><span><People size={15} /> {menu.minGuests}–{menu.maxGuests} khách</span>
          <ArrowUpRight size={19} className="gc-card-arrow" /></div>
        <h3>{menu.name}</h3>
        <p className="gc-menu-description">{menu.description || 'Khám phá thực đơn được chuẩn bị bởi đầu bếp GoCook.'}</p>
        <div className="gc-menu-card-bottom"><span>Đầu bếp <strong>{menu.chefName}</strong></span>
          <span className="gc-price">{formatPrice(menu.referencePrice)}</span></div>
      </div>
    </button>
  );
}

interface ChefCardProps {
  chef: HomeChef;
  onSelect: (chef: HomeChef) => void;
}

export function ChefCard({ chef, onSelect }: ChefCardProps) {
  return (
    <button type="button" className="gc-chef-card" onClick={() => onSelect(chef)}
      aria-label={`Xem thông tin đầu bếp ${chef.name}`}>
      <div className="gc-chef-image-wrap">
        <img src={chef.avatarUrl || '/assets/chef.png'} alt={chef.name} loading="lazy"
          onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = '/assets/chef.png'; }} />
      </div>
      <div className="gc-chef-card-body">
        <span className="gc-chef-subtitle"><StarFill size={12} /> Đầu bếp GoCook</span>
        <h3>{chef.name}</h3>
        <p className="gc-chef-bio">{chef.bio || 'Sẵn sàng mang trải nghiệm ẩm thực đến gian bếp của bạn.'}</p>
        <div className="gc-chef-card-footer"><span>{chef.experienceYears} năm kinh nghiệm</span><ArrowUpRight /></div>
      </div>
    </button>
  );
}
