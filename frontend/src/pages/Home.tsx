import { useState, type SyntheticEvent } from 'react';
import { Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Check2Circle, GeoAlt, People, Search, ShieldCheck } from 'react-bootstrap-icons';
import { useCatalog } from '../hooks/useCatalog';
import { displayPrice } from '../components/home/catalogData';
import '../styles/home.css';

export default function Home() {
    const navigate = useNavigate();
    const catalog = useCatalog();
    const [keyword, setKeyword] = useState('');
    const [guests, setGuests] = useState(4);
    const [area, setArea] = useState('TP. Hồ Chí Minh');

    function onSearch(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        const params = new URLSearchParams();
        if (keyword.trim()) params.set('q', keyword.trim());
        params.set('guests', String(guests));
        navigate(`/menus?${params.toString()}`);
    }

    return (
        <div className="gc-home-page">
            <section className="gc-home-hero">
                <Container className="gc-home-hero-grid">
                    <div className="gc-home-hero-copy">
                        <p className="gc-overline">TRẢI NGHIỆM NẤU ĂN TRỰC TIẾP TẠI NHÀ</p>
                        <h1>Đầu bếp bạn chọn.<br /><span>Bữa ăn bạn muốn.</span><br />Ngay tại nhà.</h1>
                        <p className="gc-home-lead">GoCook kết nối bạn với đầu bếp phù hợp để chuẩn bị bữa cơm gia đình, tiệc họp mặt hoặc những dịp đặc biệt ngay tại căn bếp nhà bạn.</p>
                        <div className="gc-home-feature"><Check2Circle size={19} /><div><strong>Không phải đồ ăn giao sẵn</strong><small>Đầu bếp đến tận nhà, nấu trực tiếp và dọn dẹp sau bữa ăn.</small></div></div>
                        <div className="gc-home-hero-buttons">
                            <Link to="/menus" className="gc-home-button gc-home-button-primary">Khám phá thực đơn <ArrowRight /></Link>
                            <Link to="/create-menu" className="gc-home-button gc-home-button-outline">Tự tạo thực đơn</Link>
                        </div>
                        <div className="gc-home-assurances"><span><ShieldCheck /> Đầu bếp có hồ sơ</span><span><Check2Circle /> Chọn theo nhu cầu</span><span><Check2Circle /> Nấu tại nhà</span></div>
                    </div>
                    <div className="gc-home-hero-image">
                        <img src="/assets/hero.png" alt="Đầu bếp đang chuẩn bị món ăn tại gian bếp gia đình" />
                        <div className="gc-home-image-caption"><span>Hương vị cơm nhà</span><strong>Chọn món bạn thích, để đầu bếp chuẩn bị.</strong></div>
                    </div>
                </Container>
                <Container>
                    <form className="gc-home-search" onSubmit={onSearch}>
                        <label><GeoAlt /><span><small>KHU VỰC CỦA BẠN</small><select value={area} onChange={(event) => setArea(event.target.value)}><option>TP. Hồ Chí Minh</option><option>Hà Nội</option><option>Khu vực khác</option></select></span></label>
                        <label><Search /><span><small>MÓN ĂN / THỰC ĐƠN</small><input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="Cơm nhà, món chay, lẩu..." /></span></label>
                        <label><People /><span><small>SỐ NGƯỜI ĂN</small><select value={guests} onChange={(event) => setGuests(Number(event.target.value))}>{[2, 3, 4, 5, 6, 8, 10, 12].map((value) => <option key={value} value={value}>{value} người</option>)}</select></span></label>
                        <button className="gc-home-button gc-home-button-primary" type="submit">Tìm thực đơn <ArrowRight /></button>
                    </form>
                </Container>
            </section>

            <section className="gc-home-section gc-home-options">
                <Container>
                    <div className="gc-home-section-heading centered"><p className="gc-overline">LINH HOẠT THEO NHU CẦU</p><h2>Bạn muốn đặt bữa cơm theo cách nào?</h2><p>Chọn thực đơn có sẵn hoặc tự lên danh sách món và ngân sách.</p></div>
                    <div className="gc-home-option-grid">
                        <article className="gc-home-option-card"><div className="gc-home-option-top"><span className="gc-home-option-tag">CÁCH 1</span><span className="gc-home-option-subtag">Chọn nhanh</span></div><h3>Chọn thực đơn có sẵn</h3><p>Các mâm cơm đã được chuẩn bị theo số lượng người, phù hợp để đặt cho bữa ăn gia đình và tiệc nhỏ.</p><ul><li>Tham khảo món và giá thực đơn</li><li>Lọc theo món ăn, loại thực đơn và số khách</li><li>Xem thông tin đầu bếp trước khi đặt</li></ul><div className="gc-home-option-example"><span>Ví dụ: mâm cơm 4 người</span><strong>430.000đ</strong></div><Link to="/menus" className="gc-home-button gc-home-button-primary">Xem thực đơn <ArrowRight /></Link></article>
                        <article className="gc-home-option-card gc-home-option-custom"><div className="gc-home-option-top"><span className="gc-home-option-tag">CÁCH 2</span><span className="gc-home-option-subtag">Linh hoạt</span></div><h3>Tự tạo thực đơn</h3><p>Liệt kê món bạn thích, ghi chú khẩu vị, số người ăn và ngân sách dự kiến để chuẩn bị yêu cầu riêng.</p><ul><li>Tự thêm hoặc bỏ món theo ý thích</li><li>Ghi chú dị ứng và thiết bị bếp tại nhà</li><li>Đặt giới hạn ngân sách phù hợp</li></ul><div className="gc-home-option-example"><span>Ví dụ: ngân sách dự kiến</span><strong>600–900k</strong></div><Link to="/create-menu" className="gc-home-button gc-home-button-orange">Tạo thực đơn <ArrowRight /></Link></article>
                    </div>
                </Container>
            </section>

            <section className="gc-home-section gc-home-chefs" id="dau-bep">
                <Container>
                    <div className="gc-home-section-heading spread"><div><p className="gc-overline">GIAN BẾP GOCOOK</p><h2>Đầu bếp nổi bật tại gia</h2><p>{catalog.demo ? 'Hồ sơ mẫu theo bản thiết kế PDF để xem trước bố cục.' : 'Thông tin các đầu bếp được công khai trên hệ thống.'}</p></div><Link to="/menus" className="gc-home-simple-link">Xem thực đơn <ArrowRight /></Link></div>
                    {catalog.loading ? <p className="gc-home-loading">Đang tải thông tin đầu bếp...</p> : <div className="gc-home-chef-grid">{catalog.chefs.slice(0, 4).map((chef) => <article key={chef.id} className="gc-home-chef-card"><img src={chef.avatarUrl || '/assets/chef.png'} alt={chef.id < 0 ? `Món ăn minh họa của ${chef.name}` : chef.name} onError={(event) => { event.currentTarget.src = '/assets/chef.png'; }} /><div><span>{chef.id < 0 ? 'Hồ sơ minh họa' : 'Đầu bếp GoCook'}</span><h3>{chef.name}</h3><p>{chef.bio || 'Thông tin chuyên môn sẽ được cập nhật trên hồ sơ.'}</p>{chef.experienceYears > 0 && <strong>{chef.experienceYears} năm kinh nghiệm</strong>}{chef.id < 0 && <small>Thông tin minh họa</small>}</div></article>)}</div>}
                </Container>
            </section>

            <section className="gc-home-section gc-home-featured">
                <Container>
                    <div className="gc-home-section-heading spread"><div><p className="gc-overline">BỮA CƠM GIA ĐÌNH</p><h2>Thực đơn được quan tâm</h2><p>Tham khảo các thực đơn và chọn món phù hợp với gia đình.</p></div><Link to="/menus" className="gc-home-simple-link">Xem tất cả thực đơn <ArrowRight /></Link></div>
                    {catalog.demo && !catalog.loading && <p className="gc-home-demo-notice">Đang hiển thị dữ liệu minh họa từ thiết kế PDF vì chưa có thực đơn công khai từ API. Các mức giá chưa phải báo giá thực tế.</p>}
                    {catalog.loading ? <p className="gc-home-loading">Đang tải thực đơn...</p> : <div className="gc-home-menu-grid">{catalog.menus.slice(0, 3).map((menu) => <article className="gc-home-menu-card" key={menu.id}><img src={menu.imageUrl || '/assets/meal.png'} alt={menu.name} onError={(event) => { event.currentTarget.src = '/assets/meal.png'; }} /><div className="gc-home-menu-body"><span className="gc-home-menu-category">{menu.categoryName}</span><h3>{menu.name}</h3><p>{menu.description || 'Thực đơn phù hợp cho bữa cơm tại nhà.'}</p><span className="gc-home-menu-guests"><People size={15} /> {menu.minGuests}–{menu.maxGuests} người</span><div className="gc-home-menu-footer"><strong>{displayPrice(menu.referencePrice)}</strong><Link to={`/menus?selected=${menu.id}`} className="gc-home-button gc-home-button-primary">Xem thực đơn <ArrowRight /></Link></div></div></article>)}</div>}
                </Container>
            </section>

            <section className="gc-home-section gc-home-how" id="cach-hoat-dong"><Container><div className="gc-home-section-heading centered"><p className="gc-overline">QUY TRÌNH ĐẶT BỮA ĂN</p><h2>4 bước để có bữa ăn tại nhà</h2><p>Chọn dịch vụ và chuẩn bị thông tin; các bước đặt cọc, xác nhận sẽ được hoàn thiện khi tích hợp API.</p></div><div className="gc-home-step-grid">{[
                ['01', 'Chọn dịch vụ', 'Xem thực đơn có sẵn hoặc tạo yêu cầu riêng.'],
                ['02', 'Chọn đầu bếp & lịch', 'Chọn người nấu và thời gian phù hợp.'],
                ['03', 'Xác nhận yêu cầu', 'Kiểm tra số khách, món ăn và chi phí.'],
                ['04', 'Nấu và thưởng thức', 'Đầu bếp đến nhà, chế biến và dọn dẹp.'],
            ].map(([number, title, description]) => <div className="gc-home-step" key={number}><span>{number}</span><h3>{title}</h3><p>{description}</p></div>)}</div></Container></section>
            <section className="gc-home-section gc-home-trust">
                <Container>
                    <div className="gc-home-section-heading centered">
                        <p className="gc-overline">CAM KẾT CỦA GOCOOK</p>
                        <h2>Chuẩn bị bữa ăn rõ ràng, dễ dàng</h2>
                        <p>Các thông tin thực đơn và yêu cầu đều được hiển thị để bạn kiểm tra trước khi đặt.</p>
                    </div>
                    <div className="gc-home-trust-grid">
                        <article><ShieldCheck size={25} /><h3>Thông tin đầu bếp</h3><p>Xem hồ sơ, chuyên môn và thông tin công khai của đầu bếp.</p></article>
                        <article><Check2Circle size={25} /><h3>Rõ ràng ngân sách</h3><p>Tham khảo chi phí theo thực đơn hoặc đề xuất ngân sách riêng.</p></article>
                        <article><People size={25} /><h3>Đúng số người ăn</h3><p>Chọn khẩu phần và ghi chú nhu cầu của từng gia đình.</p></article>
                        <article><GeoAlt size={25} /><h3>Nấu ngay tại nhà</h3><p>Đầu bếp chuẩn bị món ăn tại khu vực bếp bạn cung cấp.</p></article>
                    </div>
                </Container>
            </section>
            <section className="gc-home-last"><Container><div><p className="gc-overline">GOCOOK</p><h2>Chọn một bữa ăn phù hợp với nhà bạn</h2><p>Bắt đầu bằng thực đơn có sẵn hoặc tạo yêu cầu riêng.</p></div><div className="gc-home-last-buttons"><Link to="/menus" className="gc-home-button gc-home-button-white">Xem thực đơn <ArrowRight /></Link><Link to="/create-menu" className="gc-home-button gc-home-button-inverse">Tạo thực đơn</Link></div></Container></section>
        </div>
    );
}
