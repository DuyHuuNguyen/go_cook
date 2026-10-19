import { useState, type SyntheticEvent } from 'react';
import { Container, Modal } from 'react-bootstrap';
import { Link } from 'react-router';
import { ArrowRight, CalendarCheck, Check2Circle, Clock, People, Plus, ShieldCheck, Trash } from 'react-bootstrap-icons';
import { displayPrice, normalizeSearch } from '../components/home/catalogData';
import '../styles/menuPages.css';

const suggestions = ['Thịt kho tàu nước dừa', 'Canh sườn hầm rau củ', 'Gà hấp lá chanh', 'Đậu hũ sốt cà chua', 'Salad ức gà'];
const styles = [
    { id: 'Cơm gia đình truyền thống', description: 'Món mặn, món canh, món rau và tráng miệng.' },
    { id: 'Tiệc gia đình', description: 'Món khai vị, lẩu, nướng và món ăn họp mặt.' },
    { id: 'Eat Clean / Healthy', description: 'Ít dầu mỡ, nhiều rau củ, cân đối dinh dưỡng.' },
    { id: 'Món chay thanh tịnh', description: 'Rau củ, nấm, đậu và các món chay.' },
];
const tastes = ['Nêm ít đường', 'Không dùng bột ngọt', 'Giảm cay cho trẻ nhỏ', 'Ít tinh bột'];
const equipments = ['Bếp từ', 'Bếp gas', 'Nồi chiên không dầu', 'Lò nướng'];

export default function CustomMenu() {
    const [dishes, setDishes] = useState(['Cá lóc kho tộ', 'Canh chua cá bớp', 'Rau bí xào tỏi', 'Chè bưởi']);
    const [dishInput, setDishInput] = useState('');
    const [style, setStyle] = useState(styles[0].id);
    const [selectedTastes, setSelectedTastes] = useState<string[]>(['Nêm ít đường']);
    const [adults, setAdults] = useState(2);
    const [children, setChildren] = useState(2);
    const [allergy, setAllergy] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('18:30');
    const [address, setAddress] = useState('');
    const [selectedEquipments, setSelectedEquipments] = useState<string[]>(['Bếp từ']);
    const [minBudget, setMinBudget] = useState(600000);
    const [maxBudget, setMaxBudget] = useState(900000);
    const [files, setFiles] = useState<File[]>([]);
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState('');
    const total = adults + children;

    function addDish(value: string) {
        const trimmed = value.trim();
        if (!trimmed || dishes.some((dish) => normalizeSearch(dish) === normalizeSearch(trimmed))) return;
        setDishes((old) => [...old, trimmed]);
        setDishInput('');
        setError('');
    }

    function toggle(value: string, selected: string[], setter: (next: string[]) => void) {
        setter(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
    }

    function submit(event: SyntheticEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!dishes.length) {
            setError('Vui lòng chọn ít nhất một món ăn.');
            return;
        }
        if (!date) {
            setError('Vui lòng chọn ngày dùng bữa.');
            return;
        }
        if (!address.trim()) {
            setError('Vui lòng điền địa chỉ phục vụ.');
            return;
        }
        if (minBudget < 350000 || maxBudget < minBudget) {
            setError('Ngân sách tối thiểu phải từ 350.000đ và không được lớn hơn ngân sách tối đa.');
            return;
        }
        setError('');
        setShowPreview(true);
    }

    return (
        <div className="gcp-page gcp-request-page">
            <section className="gcp-request-intro"><Container><div className="gcp-breadcrumb"><Link to="/">Trang chủ</Link><span>/</span><strong>Tạo thực đơn theo ngân sách</strong></div><span className="gcp-pill">Mô hình B · Thực đơn tự chọn</span><h1>Tạo yêu cầu nấu ăn riêng theo khẩu vị & ngân sách</h1><p>Chọn món gia đình muốn ăn, số lượng người, thời gian và khoảng ngân sách để chuẩn bị yêu cầu gửi đầu bếp.</p><div className="gcp-steps"><div className="active"><b>1</b><span>Chọn món & khẩu vị</span></div><div><b>2</b><span>Số người & dị ứng</span></div><div><b>3</b><span>Thời gian & gian bếp</span></div><div><b>4</b><span>Ngân sách & xem lại</span></div></div></Container></section>
            <Container><div className="gcp-request-layout"><form className="gcp-request-form" onSubmit={submit} noValidate>
                <section className="gcp-form-panel"><div className="gcp-panel-heading"><span className="gcp-panel-icon"><Plus /></span><div><h2>Danh sách món ăn mong muốn</h2><p>Chọn món có sẵn trong gợi ý hoặc nhập thêm món bạn thích.</p></div><span className="gcp-count">{dishes.length} món đã chọn</span></div><div className="gcp-selected-dishes">{dishes.map((dish) => <button type="button" key={dish} onClick={() => setDishes((old) => old.filter((item) => item !== dish))} title={`Xóa món ${dish}`}>{dish} <span>×</span></button>)}</div><div className="gcp-add-dish"><input aria-label="Nhập tên món ăn" value={dishInput} onChange={(event) => setDishInput(event.target.value)} placeholder="Ví dụ: Bò lúc lắc, Sườn non chua ngọt..." onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); addDish(dishInput); } }} /><button type="button" onClick={() => addDish(dishInput)} className="gcp-btn gcp-btn-primary"><Plus /> Thêm món</button></div><div className="gcp-suggest"><strong>GỢI Ý MÓN ĂN GIA ĐÌNH</strong><div>{suggestions.map((suggestion) => <button type="button" key={suggestion} onClick={() => addDish(suggestion)} disabled={dishes.some((dish) => normalizeSearch(dish) === normalizeSearch(suggestion))}>+ {suggestion}</button>)}</div></div></section>

                <section className="gcp-form-panel"><div className="gcp-panel-heading"><span className="gcp-panel-icon orange">◎</span><div><h2>Phong cách ẩm thực mong muốn</h2><p>Chọn một phong cách phù hợp với bữa ăn.</p></div></div><div className="gcp-option-selection">{styles.map((item) => <label className={style === item.id ? 'selected' : ''} key={item.id}><input type="radio" name="food-style" checked={style === item.id} onChange={() => setStyle(item.id)} /><span><strong>{item.id}</strong><small>{item.description}</small></span></label>)}</div><div className="gcp-taste-group"><strong>Khẩu vị đặc biệt (có thể chọn nhiều)</strong><div>{tastes.map((taste) => <label key={taste}><input type="checkbox" checked={selectedTastes.includes(taste)} onChange={() => toggle(taste, selectedTastes, setSelectedTastes)} /> {taste}</label>)}</div></div></section>

                <section className="gcp-form-panel"><div className="gcp-panel-heading"><span className="gcp-panel-icon"><People /></span><div><h2>Số lượng người ăn & ghi chú dị ứng</h2><p>Thông tin này giúp đầu bếp chuẩn bị khẩu phần phù hợp.</p></div></div><div className="gcp-counters"><div><span>Tổng số khách</span><strong>{total}</strong><small>{total} khẩu phần</small></div><div><span>Người lớn</span><div><button type="button" onClick={() => setAdults((v) => Math.max(1, v - 1))}>−</button><strong>{adults}</strong><button type="button" onClick={() => setAdults((v) => Math.min(30, v + 1))}>+</button></div></div><div><span>Trẻ em</span><div><button type="button" onClick={() => setChildren((v) => Math.max(0, v - 1))}>−</button><strong>{children}</strong><button type="button" onClick={() => setChildren((v) => Math.min(30, v + 1))}>+</button></div></div></div><label className="gcp-field-label">Dị ứng hoặc món cần tránh<textarea value={allergy} onChange={(event) => setAllergy(event.target.value)} rows={3} placeholder="Ví dụ: Bé dị ứng tôm, ông bà ăn nhạt, không dùng đậu phộng..." /></label></section>

                <section className="gcp-form-panel"><div className="gcp-panel-heading"><span className="gcp-panel-icon"><CalendarCheck /></span><div><h2>Thời gian & gian bếp của bạn</h2><p>Chọn ngày ăn và ghi rõ địa chỉ cần phục vụ.</p></div></div><div className="gcp-form-two"><label className="gcp-field-label">Ngày nấu *<input type="date" min={new Date().toLocaleDateString('en-CA')} value={date} onChange={(event) => setDate(event.target.value)} required /></label><label className="gcp-field-label">Giờ dùng bữa *<select value={time} onChange={(event) => setTime(event.target.value)}><option value="11:30">11:30 - Bữa trưa</option><option value="18:30">18:30 - Bữa tối</option><option value="19:30">19:30 - Bữa tối muộn</option></select></label></div><label className="gcp-field-label">Địa chỉ căn hộ / nhà riêng *<input type="text" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Số nhà, đường, phường, quận, thành phố" required /></label><div className="gcp-taste-group"><strong>Thiết bị gian bếp sẵn có</strong><div>{equipments.map((equipment) => <label key={equipment}><input type="checkbox" checked={selectedEquipments.includes(equipment)} onChange={() => toggle(equipment, selectedEquipments, setSelectedEquipments)} /> {equipment}</label>)}</div></div></section>

                <section className="gcp-form-panel"><div className="gcp-panel-heading"><span className="gcp-panel-icon orange">₫</span><div><h2>Khoảng ngân sách mong muốn</h2><p>Ngân sách dự kiến cho nguyên liệu và công nấu. Mức giá chính thức cần đầu bếp xác nhận.</p></div></div><div className="gcp-form-two"><label className="gcp-field-label">Ngân sách tối thiểu (VNĐ)<input type="number" min={350000} step={50000} value={minBudget} onChange={(event) => setMinBudget(Number(event.target.value))} /></label><label className="gcp-field-label">Ngân sách tối đa (VNĐ)<input type="number" min={350000} step={50000} value={maxBudget} onChange={(event) => setMaxBudget(Number(event.target.value))} /></label></div><div className="gcp-budget-preview"><span>Mức dự kiến cho {total} người</span><strong>{displayPrice(minBudget)} – {displayPrice(maxBudget)}</strong><small>Khoảng {displayPrice(Math.round(minBudget / total))} – {displayPrice(Math.round(maxBudget / total))} / người</small></div></section>

                <section className="gcp-form-panel"><div className="gcp-panel-heading"><span className="gcp-panel-icon"><Plus /></span><div><h2>Ảnh tham khảo (không bắt buộc)</h2><p>Có thể chọn tối đa 3 ảnh JPG hoặc PNG, mỗi ảnh không quá 10 MB.</p></div></div><label className="gcp-upload"><strong>Chọn ảnh món ăn</strong><span>Ảnh chỉ được chọn trên trình duyệt, chưa tải lên máy chủ.</span><input type="file" accept="image/jpeg,image/png" multiple onChange={(event) => { const choices = Array.from(event.target.files || []).filter((file) => file.size <= 10 * 1024 * 1024).slice(0, 3); setFiles(choices); }} /></label>{files.length > 0 && <ul className="gcp-file-list">{files.map((file) => <li key={file.name}>{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB) <button type="button" onClick={() => setFiles((list) => list.filter((item) => item !== file))}><Trash size={14} /></button></li>)}</ul>}</section>
                {error && <p className="gcp-form-error" role="alert">{error}</p>}<div className="gcp-form-submit"><button type="submit" className="gcp-btn gcp-btn-primary">Xem lại yêu cầu trước khi gửi <ArrowRight /></button><p>Chưa gửi yêu cầu đến đầu bếp và chưa phát sinh thanh toán.</p></div>
            </form>
            <aside className="gcp-request-sidebar"><div className="gcp-summary-card"><div className="gcp-summary-header"><strong>TÓM TẮT YÊU CẦU</strong><span>Đang soạn</span></div><div className="gcp-summary-block"><strong>{dishes.length} món đã chọn</strong><p>{dishes.length ? dishes.join(', ') : 'Chưa chọn món'}</p></div><div className="gcp-summary-block"><strong><People /> {total} người ăn</strong><p>{adults} người lớn · {children} trẻ em</p></div><div className="gcp-summary-block"><strong><CalendarCheck /> {date || 'Chưa chọn ngày'}</strong><p>{time} · {address || 'Chưa nhập địa chỉ'}</p></div><div className="gcp-summary-budget"><span>Khoảng ngân sách dự kiến</span><strong>{displayPrice(minBudget)} – {displayPrice(maxBudget)}</strong><small>Chỉ là ngân sách bạn mong muốn.</small></div><button type="button" className="gcp-btn gcp-btn-primary" onClick={() => { const form = document.querySelector<HTMLFormElement>('.gcp-request-form'); form?.requestSubmit(); }}>Xem lại yêu cầu <ArrowRight /></button><p className="gcp-sidebar-disclaimer">Giao diện frontend: tính năng gửi yêu cầu thực tế sẽ được kết nối API ở giai đoạn tiếp theo.</p></div><div className="gcp-sidebar-info"><h3><ShieldCheck /> Chuẩn bị đúng nhu cầu</h3><p>Ghi rõ món ăn, dị ứng, khẩu vị và thiết bị bếp để đầu bếp trao đổi chính xác với bạn.</p></div><div className="gcp-sidebar-info"><h3><Clock /> Chọn giờ dùng bữa</h3><p>Thời gian nấu, giá dịch vụ và lịch đầu bếp chỉ được xác nhận khi có API đặt dịch vụ.</p></div></aside></div></Container>
            <Modal show={showPreview} onHide={() => setShowPreview(false)} centered size="lg" className="gcp-detail-modal"><Modal.Header closeButton><Modal.Title>Kiểm tra yêu cầu đã nhập</Modal.Title></Modal.Header><Modal.Body><div className="gcp-preview-list"><div><strong>Món ăn</strong><span>{dishes.join(', ')}</span></div><div><strong>Phong cách</strong><span>{style}</span></div><div><strong>Khẩu vị</strong><span>{selectedTastes.join(', ') || 'Không có yêu cầu riêng'}</span></div><div><strong>Khẩu phần</strong><span>{adults} người lớn, {children} trẻ em</span></div><div><strong>Dị ứng</strong><span>{allergy || 'Chưa ghi chú'}</span></div><div><strong>Ngày & giờ</strong><span>{date} · {time}</span></div><div><strong>Địa chỉ</strong><span>{address}</span></div><div><strong>Thiết bị bếp</strong><span>{selectedEquipments.join(', ') || 'Không ghi chú'}</span></div><div><strong>Ngân sách</strong><span>{displayPrice(minBudget)} – {displayPrice(maxBudget)}</span></div><div><strong>Ảnh tham khảo</strong><span>{files.length} tệp được chọn (chưa tải lên)</span></div></div><p className="gcp-selection-note"><Check2Circle /> Đây là bản xem trước để kiểm tra UI. Chưa có API gửi yêu cầu, chưa tạo đơn và chưa lưu dữ liệu lên hệ thống.</p><div className="gcp-modal-footer"><button className="gcp-btn gcp-btn-primary" type="button" onClick={() => setShowPreview(false)}>Quay lại chỉnh sửa</button></div></Modal.Body></Modal>
        </div>
    );
}
