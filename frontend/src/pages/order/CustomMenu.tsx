import { type FormEvent } from 'react';
import { Container, Modal } from 'react-bootstrap';
import { Link } from 'react-router';
import {
    ArrowRight, Calendar3, CheckCircleFill, ClipboardCheck, Clock, GeoAlt, Heart,
    Images, People, PlusLg, ShieldCheck, Trash3, Wallet2,
} from 'react-bootstrap-icons';
import RequestSummary from '../../components/customMenu/RequestSummary.tsx';
import { useCustomMenu } from '../../hooks/useCustomMenu.ts';
import { displayPrice } from '../../components/home/catalogData.ts';
import '../../styles/customMenu.css';

const styles = [
    { value: 'gia-dinh', label: 'Cơm gia đình truyền thống', info: 'Món nhà, canh, món mặn, rau xanh, vừa miệng.' },
    { value: 'tiec', label: 'Tiệc gia đình ấm cúng', info: 'Phù hợp tiệc sinh nhật, họp mặt và dịp đặc biệt.' },
    { value: 'eat-clean', label: 'Eat Clean / Healthy / Ít dầu', info: 'Ưu tiên thực phẩm tươi, cách chế biến nhẹ nhàng.' },
    { value: 'mon-chay', label: 'Món chay thanh tịnh', info: 'Chế biến từ rau củ, đậu hũ và nguyên liệu chay.' },
] as const;

const preferences = [
    'Nêm nếm ít đường',
    'Không dùng bột ngọt / mì chính',
    'Giảm cay',
    'Không dùng hải sản',
    'Không dùng đậu phộng',
    'Ghi chú dị ứng trong phần bên dưới',
];

const equipmentOptions = ['Bếp từ', 'Bếp gas', 'Nồi chiên không dầu', 'Lò nướng'];

export default function CustomMenu() {
    const form = useCustomMenu();
    const { draft } = form;
    const guests = draft.adults + draft.children;
    const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    function submitDish(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        form.addDish();
    }

    return (
        <div className="gcm-page">
            <Container>
                <nav className="gcm-breadcrumb" aria-label="Điều hướng">
                    <Link to="/">Trang chủ</Link><span>›</span><span>Tạo yêu cầu theo ngân sách</span>
                </nav>
                <div className="gcm-page-heading">
                    <div>
                        <span className="gcm-kicker">QUY TRÌNH TẠO MÓN RIÊNG · BẠN LÀ NGƯỜI CHỌN</span>
                        <h1>Tạo Yêu Cầu Nấu Ăn Riêng Theo Khẩu Vị &amp; Ngân Sách</h1>
                        <p>Đầu bếp chuẩn bị bữa ăn theo món bạn chọn, số lượng khách và ngân sách mong muốn.</p>
                    </div>
                    <div className="gcm-heading-time"><Clock size={20} /><span><strong>Khoảng 10–15 phút</strong><small>Điền thông tin yêu cầu</small></span></div>
                </div>

                <nav className="gcm-steps" aria-label="Các bước tạo yêu cầu">
                    <a href="#tao-mon"><b>1</b><span><small>BƯỚC 1 · ĐANG THỰC HIỆN</small>Món &amp; Khẩu vị</span></a>
                    <a href="#so-khach"><b>2</b><span><small>BƯỚC 2</small>Số người &amp; Dị ứng</span></a>
                    <a href="#thoi-gian"><b>3</b><span><small>BƯỚC 3</small>Thời gian &amp; Gian bếp</span></a>
                    <a href="#ngan-sach"><b>4</b><span><small>BƯỚC 4</small>Ngân sách &amp; Gửi đơn</span></a>
                </nav>

                <div className="gcm-layout">
                    <div className="gcm-form-column">
                        <section className="gcm-panel" id="tao-mon">
                            <div className="gcm-panel-heading">
                                <div className="gcm-heading-icon green"><ClipboardCheck /></div>
                                <div><h2>Danh sách món ăn mong muốn</h2><p>Nhập những món bạn thích. Bạn có thể thêm hoặc xóa bất cứ lúc nào.</p></div>
                                <span className="gcm-count">{draft.dishes.length} món đã chọn</span>
                            </div>
                            {draft.dishes.length > 0 ? (
                                <ul className="gcm-dish-tags">
                                    {draft.dishes.map((dish) => <li key={dish}>{dish}<button type="button" onClick={() => form.removeDish(dish)} aria-label={`Xóa ${dish}`}><Trash3 size={13} /></button></li>)}
                                </ul>
                            ) : <p className="gcm-no-dish">Chưa chọn món nào. Hãy nhập món đầu tiên của bạn.</p>}
                            <form className="gcm-add-dish" onSubmit={submitDish}>
                                <label className="gcm-visually-hidden" htmlFor="gcm-dish-name">Tên món ăn</label>
                                <input id="gcm-dish-name" value={form.newDish} maxLength={100} onChange={(event) => form.setNewDish(event.target.value)} placeholder="Nhập tên món bạn muốn nấu..." />
                                <button type="submit"><PlusLg size={15} /> Thêm món</button>
                            </form>
                            <p className="gcm-field-hint">Bạn có thể tự nhập bất kỳ món ăn nào, không cần chờ danh sách món từ database.</p>
                        </section>

                        <section className="gcm-panel">
                            <div className="gcm-panel-heading">
                                <div className="gcm-heading-icon orange"><Heart /></div>
                                <div><h2>Phong cách ẩm thực mong muốn</h2><p>Chọn cách chế biến phù hợp với gia đình bạn.</p></div>
                            </div>
                            <div className="gcm-style-grid">
                                {styles.map((option) => <label className={`gcm-style ${draft.servingStyle === option.value ? 'selected' : ''}`} key={option.value}>
                                    <input type="radio" name="servingStyle" value={option.value} checked={draft.servingStyle === option.value} onChange={() => form.update('servingStyle', option.value)} />
                                    <span><strong>{option.label}</strong><small>{option.info}</small></span>
                                </label>)}
                            </div>
                            <h3 className="gcm-subtitle">Khẩu vị / Thực phẩm cần tránh (chọn nếu có)</h3>
                            <div className="gcm-check-grid">
                                {preferences.map((item) => <label key={item} className="gcm-check-item">
                                    <input type="checkbox" checked={draft.preferences.includes(item)} onChange={() => form.toggleList('preferences', item)} /> {item}
                                </label>)}
                            </div>
                        </section>

                        <section className="gcm-panel" id="so-khach">
                            <div className="gcm-panel-heading">
                                <div className="gcm-heading-icon green"><People /></div>
                                <div><h2>Số lượng người ăn &amp; Ghi chú dị ứng</h2><p>Đầu bếp tính toán phần ăn theo số khách thực tế.</p></div>
                            </div>
                            <div className="gcm-guest-grid">
                                <div className="gcm-guest-card"><span>Tổng số khách</span><strong>{guests}</strong><small>{guests} người sẽ dùng bữa</small></div>
                                <div className="gcm-guest-card"><span>Người lớn</span><div className="gcm-guest-counter"><button type="button" onClick={() => form.changeGuests('adults', -1)} disabled={draft.adults === 0} aria-label="Giảm người lớn">−</button><strong>{draft.adults}</strong><button type="button" onClick={() => form.changeGuests('adults', 1)} aria-label="Tăng người lớn">+</button></div><small>Từ 10 tuổi trở lên</small></div>
                                <div className="gcm-guest-card"><span>Trẻ em (&lt; 10 tuổi)</span><div className="gcm-guest-counter"><button type="button" onClick={() => form.changeGuests('children', -1)} disabled={draft.children === 0} aria-label="Giảm trẻ em">−</button><strong>{draft.children}</strong><button type="button" onClick={() => form.changeGuests('children', 1)} aria-label="Tăng trẻ em">+</button></div><small>Điều chỉnh theo nhu cầu</small></div>
                            </div>
                            <label className="gcm-field-label" htmlFor="gcm-notes">Ghi chú dị ứng hoặc kiêng khem của gia đình:</label>
                            <textarea id="gcm-notes" rows={3} maxLength={1200} value={draft.notes} onChange={(event) => form.update('notes', event.target.value)} placeholder="Ví dụ: không ăn đậu phộng, ít cay, dị ứng tôm..." />
                        </section>

                        <section className="gcm-panel" id="thoi-gian">
                            <div className="gcm-panel-heading">
                                <div className="gcm-heading-icon green"><Calendar3 /></div>
                                <div><h2>Thời gian &amp; Cơ sở gian bếp của bạn</h2><p>Ghi rõ địa điểm để đầu bếp chủ động sắp xếp công việc.</p></div>
                            </div>
                            <div className="gcm-field-grid">
                                <label>Ngày nấu
                                    <input type="date" min={today} value={draft.mealDate} onChange={(event) => form.update('mealDate', event.target.value)} />
                                </label>
                                <label>Giờ dùng bữa dự kiến
                                    <select value={draft.mealTime} onChange={(event) => form.update('mealTime', event.target.value)}>
                                        <option value="11:30">11:30 · Bữa trưa</option>
                                        <option value="17:30">17:30 · Bữa chiều</option>
                                        <option value="18:30">18:30 · Bữa tối</option>
                                        <option value="19:30">19:30 · Bữa tối muộn</option>
                                    </select>
                                </label>
                            </div>
                            <label className="gcm-field-label" htmlFor="gcm-address">Địa chỉ cần nấu / nhà riêng:</label>
                            <div className="gcm-address-input"><GeoAlt size={19} /><input id="gcm-address" value={draft.address} maxLength={240} onChange={(event) => form.update('address', event.target.value)} placeholder="Số nhà, đường, phường, quận/huyện, thành phố" /></div>
                            <label className="gcm-field-label" htmlFor="gcm-location-notes">Ghi chú địa điểm</label>
                            <input id="gcm-location-notes" value={draft.locationNotes} maxLength={240} onChange={(event) => form.update('locationNotes', event.target.value)} placeholder="Ví dụ: chung cư, tầng, hướng dẫn gửi xe..." />
                            <h3 className="gcm-subtitle">Thiết bị gian bếp sẵn có tại nhà:</h3>
                            <div className="gcm-equipment-grid">
                                {equipmentOptions.map((item) => <label className="gcm-check-item" key={item}>
                                    <input type="checkbox" checked={draft.equipment.includes(item)} onChange={() => form.toggleList('equipment', item)} /> {item}
                                </label>)}
                            </div>
                            <p className="gcm-tip"><CheckCircleFill /> Đầu bếp sẽ trao đổi thêm về nguyên liệu và dụng cụ sau khi nhận được yêu cầu.</p>
                        </section>

                        <section className="gcm-panel" id="ngan-sach">
                            <div className="gcm-panel-heading">
                                <div className="gcm-heading-icon orange"><Wallet2 /></div>
                                <div><h2>Khoảng ngân sách mong muốn (Trọn gói)</h2><p>Đặt mức ngân sách phù hợp. Chi phí thực tế sẽ được thỏa thuận trước khi xác nhận.</p></div>
                            </div>
                            <div className="gcm-field-grid gcm-budget-grid">
                                <label>Ngân sách tối thiểu (VNĐ)
                                    <input type="number" step={50000} min={50000} value={draft.minBudget} onChange={(event) => form.update('minBudget', Number(event.target.value))} />
                                </label>
                                <label>Ngân sách tối đa (VNĐ)
                                    <input type="number" step={50000} min={50000} value={draft.maxBudget} onChange={(event) => form.update('maxBudget', Number(event.target.value))} />
                                </label>
                            </div>
                            <div className="gcm-budget-line"><span>{displayPrice(draft.minBudget)}</span><span>{displayPrice(draft.maxBudget)}</span></div>
                            <div className="gcm-budget-indicator"><span /></div>
                            <p className="gcm-tip"><ShieldCheck /> Bạn chủ động quyết định ngân sách. Mọi thay đổi sẽ được trao đổi trước khi đặt dịch vụ.</p>
                        </section>

                        <section className="gcm-panel gcm-reference-panel">
                            <div className="gcm-panel-heading">
                                <div className="gcm-heading-icon green"><Images /></div>
                                <div><h2>Ảnh địa điểm hoặc thực đơn tham khảo</h2><p>Không bắt buộc. Ảnh giúp đầu bếp hiểu rõ mong muốn của bạn.</p></div>
                            </div>
                            <label className="gcm-upload-area">
                                <Images size={28} />
                                <strong>{draft.referenceFile ? draft.referenceFile.name : 'Kéo thả ảnh hoặc bấm để chọn ảnh'}</strong>
                                <small>JPEG, PNG, WEBP · tối đa 5 MB</small>
                                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => {
                                    const file = event.target.files?.[0] || null;
                                    form.update('referenceFile', file && file.size <= 5 * 1024 * 1024 ? file : null);
                                }} />
                            </label>
                            <p className="gcm-field-hint">Ảnh chỉ được chọn trên máy. Chưa tải lên hệ thống khi API chưa được triển khai.</p>
                        </section>
                        {form.message && <div className="gcm-mobile-message" role="alert">{form.message}</div>}
                        <button type="button" className="gcm-primary-button gcm-mobile-submit" onClick={form.openPreview}>Xem trước yêu cầu <ArrowRight /></button>
                    </div>
                    <RequestSummary draft={draft} message={form.message} onPreview={form.openPreview} />
                </div>
            </Container>

            <Modal show={form.previewOpen} onHide={() => form.setPreviewOpen(false)} centered size="lg" className="gcm-preview-modal">
                <Modal.Header closeButton><Modal.Title>Xem trước yêu cầu nấu ăn</Modal.Title></Modal.Header>
                <Modal.Body>
                    <p>Kiểm tra lại thông tin trước khi gửi đến đầu bếp.</p>
                    <dl>
                        <dt>Món đã chọn</dt><dd>{draft.dishes.join(', ')}</dd>
                        <dt>Số khách</dt><dd>{guests} người ({draft.adults} người lớn, {draft.children} trẻ em)</dd>
                        <dt>Ngày &amp; giờ</dt><dd>{draft.mealDate} · {draft.mealTime}</dd>
                        <dt>Địa chỉ</dt><dd>{draft.address}</dd>
                        <dt>Ngân sách</dt><dd>{displayPrice(draft.minBudget)} – {displayPrice(draft.maxBudget)}</dd>
                        {draft.notes && <><dt>Ghi chú</dt><dd>{draft.notes}</dd></>}
                        {draft.preferences.length > 0 && <><dt>Khẩu vị</dt><dd>{draft.preferences.join(', ')}</dd></>}
                    </dl>
                    <div className="gcm-preview-info"><CheckCircleFill /> Bản xem trước chỉ tồn tại trên trình duyệt. Chưa gửi yêu cầu hoặc lưu vào database.</div>
                    <div className="gcm-preview-actions">
                        <button type="button" onClick={() => form.setPreviewOpen(false)} className="gcm-secondary-button">Tiếp tục chỉnh sửa</button>
                        <button type="button" className="gcm-primary-button" disabled title="Đang chờ Backend triển khai API">Gửi yêu cầu (chờ API)</button>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
