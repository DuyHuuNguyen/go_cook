import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router';
import { ArrowRight, CheckCircle, Clock, Funnel, People, Search, ShieldCheck } from 'react-bootstrap-icons';
import MenuCard from '../components/menu/MenuCard';
import { useCatalog } from '../hooks/useCatalog';
import { normalizeSearch, type CatalogMenu } from '../components/home/catalogData';
import '../styles/menuPages.css';

const priceRanges = [
    { value: 'all', label: 'Tất cả' },
    { value: 'under500', label: 'Dưới 500k' },
    { value: '500to1000', label: '500k - 1 triệu' },
    { value: '1000to2000', label: '1 triệu - 2 triệu' },
    { value: 'over2000', label: 'Trên 2 triệu' },
];

export default function MenuCatalog() {
    const catalog = useCatalog();
    const [params, setParams] = useSearchParams();
    const [keyword, setKeyword] = useState(params.get('q') || '');
    const [searchText, setSearchText] = useState(params.get('q') || '');
    const [category, setCategory] = useState('all');
    const [priceRange, setPriceRange] = useState('all');
    const [sort, setSort] = useState('default');
    const [guests, setGuests] = useState(Number(params.get('guests')) || 0);
    const [page, setPage] = useState(1);

    const categories = useMemo(
        () => [...new Set(catalog.menus.map((menu) => menu.categoryName).filter(Boolean))],
        [catalog.menus],
    );

    const filteredMenus = useMemo(() => {
        const query = normalizeSearch(searchText);
        const items = catalog.menus.filter((menu) => {
            const searchable = `${menu.name} ${menu.description || ''} ${menu.categoryName} ${menu.chefName} ${(menu.dishes || []).join(' ')}`;
            const price = menu.referencePrice;
            const priceMatches = priceRange === 'all'
                || (priceRange === 'under500' && price < 500000)
                || (priceRange === '500to1000' && price >= 500000 && price < 1000000)
                || (priceRange === '1000to2000' && price >= 1000000 && price < 2000000)
                || (priceRange === 'over2000' && price >= 2000000);
            return (!query || normalizeSearch(searchable).includes(query))
                && (category === 'all' || category === menu.categoryName)
                && (guests === 0 || (guests >= menu.minGuests && guests <= menu.maxGuests))
                && priceMatches;
        });
        if (sort === 'price-low') return items.sort((a, b) => a.referencePrice - b.referencePrice);
        if (sort === 'price-high') return items.sort((a, b) => b.referencePrice - a.referencePrice);
        return items;
    }, [catalog.menus, searchText, category, priceRange, guests, sort]);

    const pageSize = 6;
    const pageCount = Math.max(1, Math.ceil(filteredMenus.length / pageSize));
    const displayedMenus = filteredMenus.slice((page - 1) * pageSize, page * pageSize);

    function handleSearch(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSearchText(keyword.trim());
        setPage(1);
    }

    function resetFilters() {
        setKeyword('');
        setSearchText('');
        setCategory('all');
        setPriceRange('all');
        setGuests(0);
        setSort('default');
        setPage(1);
    }

    return (
        <div className="gcp-page">
            <section className="gcp-hero">
                <Container>
                    <nav className="gcp-breadcrumb" aria-label="Điều hướng">
                        <Link to="/">Trang chủ</Link><span>/</span><span>Danh mục thực đơn có sẵn</span>
                    </nav>
                    <span className="gcp-hero-kicker">Mô hình A · Thực đơn chế biến tại gia trọn gói</span>
                    <div className="gcp-hero-content">
                        <div>
                            <h1>Bộ Sưu Tập Mâm Cơm Gia Đình &amp; Tiệc Tại Gia Chuẩn Vị Mẹ Nấu</h1>
                            <p>Chọn thực đơn phù hợp cho bữa cơm gia đình hoặc buổi tiệc tại nhà. Xem đầu bếp, món ăn và chi phí dự kiến trước khi quyết định.</p>
                        </div>
                        <Link to="/create-menu" className="gcp-hero-promo">
                            <strong>Bạn có khẩu vị riêng biệt?</strong>
                            <span>Tự chọn món, số lượng khách và ngân sách cho bữa ăn.</span>
                            <b>Tạo yêu cầu theo ngân sách <ArrowRight /></b>
                        </Link>
                    </div>
                    <form className="gcp-search" onSubmit={handleSearch}>
                        <label className="gcp-search-input">
                            <Search size={19} />
                            <input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Nhập tên món, loại tiệc, tên thực đơn..." type="search" />
                        </label>
                        <label className="gcp-guests-select">
                            <People size={18} />
                            <select value={guests} onChange={(event) => { setGuests(Number(event.target.value)); setPage(1); }} aria-label="Quy mô bữa ăn">
                                <option value={0}>Tất cả khẩu phần</option>
                                {[2, 3, 4, 5, 6, 8, 10, 12, 15, 20].map((value) => <option key={value} value={value}>{value} người</option>)}
                            </select>
                        </label>
                        <button className="gcp-btn gcp-btn-primary gcp-search-button" type="submit"><Funnel size={17} /> Tìm kiếm thực đơn</button>
                    </form>
                </Container>
            </section>

            <section className="gcp-filter-section" aria-label="Bộ lọc thực đơn">
                <Container>
                    <div className="gcp-filter-row">
                        <strong>THƯỜNG PHÁI:</strong>
                        <div className="gcp-filter-options">
                            <button type="button" className={`gcp-filter-pill ${category === 'all' ? 'active' : ''}`} onClick={() => { setCategory('all'); setPage(1); }}>Tất cả</button>
                            {categories.map((name) => (
                                <button type="button" className={`gcp-filter-pill ${category === name ? 'active' : ''}`} key={name} onClick={() => { setCategory(name); setPage(1); }}>{name}</button>
                            ))}
                        </div>
                    </div>
                    <div className="gcp-filter-row gcp-filter-secondary">
                        <strong>MỨC GIÁ:</strong>
                        <div className="gcp-filter-options">
                            {priceRanges.map(({ value, label }) => (
                                <button type="button" className={`gcp-filter-pill gcp-filter-price ${priceRange === value ? 'active' : ''}`} key={value} onClick={() => { setPriceRange(value); setPage(1); }}>{label}</button>
                            ))}
                        </div>
                        <label className="gcp-sort">Sắp xếp theo:
                            <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
                                <option value="default">Phổ biến nhất</option>
                                <option value="price-low">Giá thấp đến cao</option>
                                <option value="price-high">Giá cao đến thấp</option>
                            </select>
                        </label>
                    </div>
                </Container>
            </section>

            <section className="gcp-catalog-list">
                <Container>
                    <div className="gcp-section-heading">
                        <h2>Thực đơn nổi bật sẵn có <span>{catalog.loading ? 'Đang tải' : `${filteredMenus.length} thực đơn`}</span></h2>
                        <p><CheckCircle size={16} /> Giá dự kiến · Điều chỉnh theo số khách · Thống nhất trước khi đặt</p>
                    </div>
                    {catalog.loading ? (
                        <div className="gcp-empty" role="status"><h3>Đang tải thực đơn...</h3><p>Vui lòng đợi trong giây lát.</p></div>
                    ) : catalog.error ? (
                        <div className="gcp-empty" role="alert">
                            <h3>Chưa kết nối được dữ liệu thực đơn</h3>
                            <p>API chưa sẵn sàng hoặc máy chủ đang gặp sự cố. Danh sách sẽ hiển thị khi Backend trả dữ liệu.</p>
                            <button type="button" onClick={catalog.retry} className="gcp-btn gcp-btn-primary">Thử lại</button>
                        </div>
                    ) : filteredMenus.length === 0 ? (
                        <div className="gcp-empty">
                            <h3>{catalog.menus.length ? 'Không tìm thấy thực đơn phù hợp' : 'Chưa có thực đơn trên hệ thống'}</h3>
                            <p>{catalog.menus.length ? 'Bạn thử thay đổi từ khóa hoặc bộ lọc.' : 'Thực đơn thực tế sẽ xuất hiện tại đây khi đầu bếp thêm dữ liệu.'}</p>
                            {catalog.menus.length > 0 && <button type="button" onClick={resetFilters} className="gcp-btn gcp-btn-light">Xóa bộ lọc</button>}
                            <Link to="/create-menu" className="gcp-btn gcp-btn-primary">Tự tạo yêu cầu <ArrowRight size={16} /></Link>
                        </div>
                    ) : (
                        <>
                            <div className="gcp-card-grid">
                                {displayedMenus.map((menu) => <MenuCard menu={menu} key={menu.id} />)}
                            </div>
                            <div className="gcp-pagination">
                                <span>Đang hiển thị {displayedMenus.length} / {filteredMenus.length} thực đơn</span>
                                <div>
                                    <button type="button" disabled={page === 1} onClick={() => setPage((value) => value - 1)}>‹</button>
                                    {Array.from({ length: pageCount }, (_, i) => (
                                        <button type="button" key={i + 1} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)} aria-label={`Trang ${i + 1}`}>{i + 1}</button>
                                    ))}
                                    <button type="button" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)}>›</button>
                                </div>
                            </div>
                        </>
                    )}
                </Container>
            </section>

            <section className="gcp-bottom-info">
                <Container>
                    <div className="gcp-bottom-benefits">
                        <div><ShieldCheck /><span><strong>Nguyên liệu theo thực đơn</strong><small>Kiểm tra thực đơn trước khi xác nhận dịch vụ.</small></span></div>
                        <div><People /><span><strong>Nấu đúng khẩu vị từng nhà</strong><small>Chọn đầu bếp phù hợp và trao đổi yêu cầu.</small></span></div>
                        <div><Clock /><span><strong>Đơn sạch, chuẩn bị kỹ</strong><small>Chủ động sắp xếp ngày và giờ dùng bữa.</small></span></div>
                    </div>
                    <div className="gcp-bottom-cta">
                        <p>KHÁM PHÁ LINH HOẠT</p>
                        <h2>Bạn Vẫn Đang Tìm Kiếm Trải Nghiệm Khác?</h2>
                        <span>Hãy tự lên danh sách món ăn yêu thích và gửi yêu cầu cho đầu bếp khi dịch vụ sẵn sàng.</span>
                        <Link to="/create-menu" className="gcp-btn gcp-btn-primary">Tạo yêu cầu nấu ăn riêng <ArrowRight /></Link>
                    </div>
                </Container>
            </section>
        </div>
    );
}
