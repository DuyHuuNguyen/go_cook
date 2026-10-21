import { Container } from 'react-bootstrap';
import { Link } from 'react-router';
import { ArrowRight, People } from 'react-bootstrap-icons';
import { displayPrice, type CatalogMenu } from './catalogData';
import HomeListState from './HomeListState';

interface HomeMenusProps {
    menus: CatalogMenu[];
    loading: boolean;
    error: boolean;
    onRetry: () => void;
    onSelect: (menu: CatalogMenu) => void;
}

export default function HomeMenus({ menus, loading, error, onRetry, onSelect }: HomeMenusProps) {
    return (
        <section className="gc-home-section gc-home-featured" id="thuc-don-noi-bat">
            <Container>
                <div className="gc-home-heading gc-home-heading-row">
                    <div>
                        <p className="gc-home-kicker">GỢI Ý CHO BỮA CƠM NHÀ</p>
                        <h2>Thực đơn được quan tâm</h2>
                        <p>Tham khảo thực đơn hiện có trên GoCook.</p>
                    </div>
                    <Link to="/menus" className="gc-home-text-link">
                        Xem tất cả <ArrowRight size={17} />
                    </Link>
                </div>
                {loading || error || menus.length === 0 ? (
                    <HomeListState
                        loading={loading}
                        error={error}
                        onRetry={onRetry}
                        emptyMessage="Hiện chưa có thực đơn nào được công khai. Vui lòng quay lại sau."
                    />
                ) : (
                    <div className="gc-home-menu-grid">
                        {menus.map((menu) => (
                            <article className="gc-home-menu-card" key={menu.id}>
                                <button
                                    className="gc-home-menu-image"
                                    type="button"
                                    onClick={() => onSelect(menu)}
                                    aria-label={`Xem thực đơn ${menu.name}`}
                                >
                                    {menu.imageUrl ? (
                                        <img src={menu.imageUrl} alt={menu.name} loading="lazy" />
                                    ) : (
                                        <span className="gc-home-image-placeholder">Chưa có ảnh thực đơn</span>
                                    )}
                                </button>
                                <div className="gc-home-menu-body">
                                    <small>{menu.categoryName}</small>
                                    <h3>{menu.name}</h3>
                                    <p>{menu.description || 'Chưa có mô tả thực đơn.'}</p>
                                    <div className="gc-home-menu-meta">
                                        <span><People size={16} /> {menu.minGuests}–{menu.maxGuests} người</span>
                                        {menu.dishes && <span>{menu.dishes.length} món</span>}
                                    </div>
                                    <div className="gc-home-menu-bottom">
                                        <div>
                                            <small>Giá tham khảo từ</small>
                                            <strong>{displayPrice(menu.referencePrice)}</strong>
                                        </div>
                                        <button
                                            type="button"
                                            className="gc-home-btn gc-home-btn-primary"
                                            onClick={() => onSelect(menu)}
                                        >
                                            Xem chi tiết <ArrowRight size={17} />
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                )}
            </Container>
        </section>
    );
}
