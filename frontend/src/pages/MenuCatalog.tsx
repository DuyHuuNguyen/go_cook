import { useEffect, useMemo, useState, type SyntheticEvent } from 'react';
import { Container, Modal } from 'react-bootstrap';
import { Link, useSearchParams } from 'react-router';
import { ArrowRight, Check2Circle, Clock, People, Search, ShieldCheck } from 'react-bootstrap-icons';
import { useCatalog } from '../hooks/useCatalog';
import { displayPrice, normalizeSearch, type CatalogMenu } from '../components/home/catalogData';
import '../styles/menuPages.css';

const priceRanges = [
    { value: 'all', text: 'Tất cả giá' },
    { value: 'under500', text: 'Dưới 500k' },
    { value: '500to1000', text: '500k – 1 triệu' },
    { value: '1000to2000', text: '1 – 2 triệu' },
    { value: 'over2000', text: 'Trên 2 triệu' },
];

export default function MenuCatalog() {
    const data = useCatalog();
    const [params, setParams] = useSearchParams();
    const [keyword, setKeyword] = useState(params.get('q') || '');
    const [submitted, setSubmitted] = useState(params.get('q') || '');
    const [category, setCategory] = useState('all');
    const [price, setPrice] = useState('all');
    const [sort, setSort] = useState('default');
    const [guests, setGuests] = useState(Number(params.get('guests')) || 0);
    const [page, setPage] = useState(1);
    const [selectedMenu, setSelectedMenu] = useState<CatalogMenu | null>(null);
    const [chosenGuests, setChosenGuests] = useState(4);
    const [mealDate, setMealDate] = useState('');
    const [mealTime, setMealTime] = useState('18:30');
    const [picked, setPicked] = useState(false);

    useEffect(() => {
        const selectedId = Number(params.get('selected'));
        if (!selectedId || data.loading) return;
        const item = data.menus.find((menu) => menu.id === selectedId);
        if (item) openMenu(item);
        const next = new URLSearchParams(params);
        next.delete('selected');
        setParams(next, { replace: true });
        // Only respond to URL changes from navigation, not to changes inside the modal.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.loading, data.menus, params, setParams]);

    const categories = useMemo(() => [...new Set(data.menus.map((menu) => menu.categoryName))], [data.menus]);
    const result = useMemo(() => {
        const query = normalizeSearch(submitted);
        const filtered = data.menus.filter((menu) => {
            const matchText = !query || normalizeSearch(`${menu.name} ${menu.description || ''} ${menu.categoryName} ${menu.chefName} ${(menu.dishes || []).join(' ')}`).includes(query);
            const matchCategory = category === 'all' || menu.categoryName === category;
            const matchGuests = guests === 0 || (guests >= menu.minGuests && guests <= menu.maxGuests);
            const amount = menu.referencePrice;
            const matchPrice = price === 'all' || (price === 'under500' && amount < 500000) ||
                (price === '500to1000' && amount >= 500000 && amount < 1000000) ||
                (price === '1000to2000' && amount >= 1000000 && amount < 2000000) ||
                (price === 'over2000' && amount >= 2000000);
            return matchText && matchCategory && matchGuests && matchPrice;
        });
        if (sort === 'low') return filtered.sort((a, b) => a.referencePrice - b.referencePrice);
        if (sort === 'high') return filtered.sort((a, b) => b.referencePrice - a.referencePrice);
        return filtered;
    }, [data.menus, submitted, category, price, guests, sort]);

    const pageSize = 6;
    const pageCount = Math.max(1, Math.ceil(result.length / pageSize));
    const visible = result.slice((page - 1) * pageSize, page * pageSize);

    function openMenu(menu: CatalogMenu) {
        setSelectedMenu(menu);
        setChosenGuests(menu.minGuests);
        setMealDate('');
        setMealTime('18:30');
        setPicked(false);
    }

    function applySearch(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmitted(keyword);
        setPage(1);
    }

    function selectCategory(value: string) {
        setCategory(value);
        setPage(1);
    }

    return (
        <div className="gcp-page">
            <section className="gcp-catalog-hero"><Container><div className="gcp-breadcrumb"><Link to="/">Trang chủ</Link><span>/</span><strong>Thực đơn có sẵn</strong></div><div className="gcp-hero-two-column"><div><span className="gcp-pill">Mô hình A · Thực đơn trọn gói</span><h1>Thực đơn gia đình & tiệc tại nhà</h1><p>Chọn thực đơn phù hợp, xem món ăn và tham khảo chi phí trước khi đặt dịch vụ.</p></div><Link to="/create-menu" className="gcp-promo-box"><strong>Bạn muốn tự chọn món?</strong><span>Tạo yêu cầu riêng theo khẩu vị và ngân sách.</span><b>Tạo thực đơn <ArrowRight /></b></Link></div><form className="gcp-search-bar" onSubmit={applySearch}><label className="gcp-search-field"><Search size={19} /><input type="search" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Tìm món ăn hoặc tên thực đơn..." /></label><label><People size={17} /><select value={guests} onChange={(event) => { setGuests(Number(event.target.value)); setPage(1); }} aria-label="Lọc số người ăn"><option value={0}>Tất cả khẩu phần</option>{[2, 3, 4, 5, 6, 8, 10, 12].map((value) => <option value={value} key={value}>{value} người ăn</option>)}</select></label><button type="submit" className="gcp-btn gcp-btn-primary">Tìm thực đơn <ArrowRight /></button></form></Container></section>
            <section className="gcp-filters"><Container><div className="gcp-filter-row"><strong>LOẠI THỰC ĐƠN:</strong><div className="gcp-chip-wrap"><button className={`gcp-chip ${category === 'all' ? 'active' : ''}`} onClick={() => selectCategory('all')} type="button">Tất cả</button>{categories.map((item) => <button type="button" className={`gcp-chip ${category === item ? 'active' : ''}`} onClick={() => selectCategory(item)} key={item}>{item}</button>)}</div></div><div className="gcp-filter-row"><strong>MỨC GIÁ:</strong><div className="gcp-chip-wrap">{priceRanges.map((range) => <button key={range.value} type="button" onClick={() => { setPrice(range.value); setPage(1); }} className={`gcp-chip subtle ${price === range.value ? 'active' : ''}`}>{range.text}</button>)}</div><label className="gcp-sort">Sắp xếp <select value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}><option value="default">Mặc định</option><option value="low">Giá thấp đến cao</option><option value="high">Giá cao đến thấp</option></select></label></div></Container></section>
            <section className="gcp-content"><Container><div className="gcp-list-heading"><h2>Thực đơn có sẵn <span>{data.loading ? '...' : `${result.length} thực đơn`}</span></h2><p><Check2Circle /> Giá hiển thị theo thông tin thực đơn; xác nhận lại khi đặt dịch vụ.</p></div>{data.demo && !data.loading && <div className="gcp-sample-banner"><span><strong>Chế độ xem giao diện:</strong> đang hiển thị 6 thực đơn mẫu từ PDF, không phải dữ liệu đang bán hoặc báo giá chính thức.</span><button type="button" onClick={data.retry}>Tải lại API</button></div>}
            {data.loading ? <div className="gcp-placeholder">Đang tải danh sách thực đơn...</div> : result.length ? <><div className="gcp-card-grid">{visible.map((menu) => <article className="gcp-menu-card" key={menu.id}><div className="gcp-card-cover"><img src={menu.imageUrl || '/assets/meal.png'} alt={menu.name} loading="lazy" onError={(event) => { event.currentTarget.src = '/assets/meal.png'; }} /><span className="gcp-image-tag">{menu.categoryName}</span></div><div className="gcp-card-body"><small><People size={14} /> {menu.minGuests}–{menu.maxGuests} người</small><h3>{menu.name}</h3><p>{menu.description || 'Thực đơn dành cho bữa ăn tại nhà.'}</p><div className="gcp-dish-list"><strong>{menu.dishes ? 'CÁC MÓN TRONG THỰC ĐƠN' : 'THÔNG TIN THỰC ĐƠN'}</strong>{menu.dishes ? <ul>{menu.dishes.map((dish) => <li key={dish}>{dish}</li>)}</ul> : <p>Chọn xem chi tiết để kiểm tra mô tả và đầu bếp phụ trách.</p>}</div><div className="gcp-card-price"><span>Giá tham khảo</span><strong>{displayPrice(menu.referencePrice)}</strong></div><div className="gcp-card-actions"><button type="button" className="gcp-btn gcp-btn-muted" onClick={() => openMenu(menu)}>Xem chi tiết</button><button type="button" className="gcp-btn gcp-btn-primary" onClick={() => openMenu(menu)}>Chọn thực đơn</button></div></div></article>)}</div><div className="gcp-pagination"><span>Hiển thị {visible.length} / {result.length} thực đơn</span><div><button type="button" disabled={page === 1} onClick={() => setPage((old) => old - 1)}>Trước</button>{Array.from({ length: pageCount }, (_, i) => <button type="button" key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>{i + 1}</button>)}<button type="button" disabled={page === pageCount} onClick={() => setPage((old) => old + 1)}>Sau</button></div></div></> : <div className="gcp-placeholder"><h3>Không tìm thấy thực đơn phù hợp</h3><p>Thử thay đổi món ăn, mức giá hoặc số người nhé.</p><button type="button" className="gcp-btn gcp-btn-muted" onClick={() => { setCategory('all'); setPrice('all'); setGuests(0); setKeyword(''); setSubmitted(''); setPage(1); }}>Xóa bộ lọc</button></div>}</Container></section>
            <section className="gcp-benefits"><Container><div><ShieldCheck /><span><strong>Thực đơn rõ ràng</strong><small>Kiểm tra món và khẩu phần trước khi chọn.</small></span></div><div><People /><span><strong>Chọn theo số khách</strong><small>Lọc thực đơn phù hợp quy mô gia đình.</small></span></div><div><Clock /><span><strong>Chủ động thời gian</strong><small>Ghi lại ngày và giờ ăn mong muốn.</small></span></div></Container></section>
            <Modal show={Boolean(selectedMenu)} onHide={() => setSelectedMenu(null)} size="lg" centered className="gcp-detail-modal"><Modal.Header closeButton><Modal.Title>Chi tiết thực đơn</Modal.Title></Modal.Header>{selectedMenu && <Modal.Body><div className="gcp-modal-content"><img src={selectedMenu.imageUrl || '/assets/meal.png'} alt="" /><div><span className="gcp-pill">{selectedMenu.categoryName}</span><h2>{selectedMenu.name}</h2><p>{selectedMenu.description}</p><p><strong>Đầu bếp:</strong> {selectedMenu.chefName}</p>{selectedMenu.dishes && <ul>{selectedMenu.dishes.map((dish) => <li key={dish}>{dish}</li>)}</ul>}<p className="gcp-modal-price">Giá tham khảo: <strong>{displayPrice(selectedMenu.referencePrice)}</strong></p></div></div><div className="gcp-modal-fields"><label>Số người ăn<input type="number" value={chosenGuests} min={selectedMenu.minGuests} max={selectedMenu.maxGuests} onChange={(event) => setChosenGuests(Math.max(selectedMenu.minGuests, Math.min(selectedMenu.maxGuests, Number(event.target.value) || selectedMenu.minGuests)))} /></label><label>Ngày dùng bữa<input type="date" min={new Date().toLocaleDateString('en-CA')} value={mealDate} onChange={(event) => setMealDate(event.target.value)} /></label><label>Giờ dùng bữa<select value={mealTime} onChange={(event) => setMealTime(event.target.value)}><option value="11:30">11:30 - Bữa trưa</option><option value="18:30">18:30 - Bữa tối</option></select></label></div>{picked && <div className="gcp-selection-note"><Check2Circle /> Đã chọn {selectedMenu.name} cho {chosenGuests} người{mealDate ? `, ngày ${mealDate}` : ''} lúc {mealTime}. Đây là bản chọn trên giao diện; chưa phát sinh đơn đặt hay thanh toán.</div>}{selectedMenu.sample && <p className="gcp-small-warning">Thực đơn minh họa: cần dữ liệu thực tế từ backend trước khi triển khai đặt nấu.</p>}<div className="gcp-modal-footer"><button type="button" className="gcp-btn gcp-btn-muted" onClick={() => setSelectedMenu(null)}>Đóng</button><button type="button" className="gcp-btn gcp-btn-primary" onClick={() => setPicked(true)}>Lưu lựa chọn trên màn hình <ArrowRight /></button></div></Modal.Body>}</Modal>
        </div>
    );
}
