import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { CheckCircle, People } from 'react-bootstrap-icons';
import type { CatalogMenu } from '../home/catalogData';
import { displayPrice } from '../home/catalogData';

interface MenuDetailModalProps {
    menu: CatalogMenu | null;
    onClose: () => void;
}

export default function MenuDetailModal({ menu, onClose }: MenuDetailModalProps) {
    const [guests, setGuests] = useState(4);
    const [date, setDate] = useState('');
    const [time, setTime] = useState('18:30');
    const [saved, setSaved] = useState(false);
    const localDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10);

    function closeModal() {
        setSaved(false);
        onClose();
    }

    function prepareSelection() {
        setSaved(true);
    }

    return (
        <Modal
            show={Boolean(menu)}
            onHide={closeModal}
            onShow={() => { setGuests(menu?.minGuests || 4); setDate(''); setTime('18:30'); setSaved(false); }}
            centered
            size="lg"
            className="gcp-detail-modal"
        >
            <Modal.Header closeButton>
                <Modal.Title>Chi tiết thực đơn</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {menu && (
                    <>
                        <div className="gcp-detail-main">
                            <img src={menu.imageUrl || '/images/menus/fallback.svg'} alt={menu.name} />
                            <div>
                                <span className="gcp-tag">{menu.categoryName}</span>
                                <h2>{menu.name}</h2>
                                <p>{menu.description || 'Thực đơn phục vụ tại nhà.'}</p>
                                <p><People /> {menu.minGuests}–{menu.maxGuests} người</p>
                                <p>Đầu bếp: {menu.chefName}</p>
                                <p><strong>{displayPrice(menu.referencePrice)}</strong> · Giá tham khảo</p>
                            </div>
                        </div>
                        {menu.dishes && menu.dishes.length > 0 && (
                            <div className="gcp-detail-dishes">
                                <strong>Các món trong thực đơn</strong>
                                <ul>{menu.dishes.map((dish) => <li key={dish}>{dish}</li>)}</ul>
                            </div>
                        )}
                        <div className="gcp-detail-fields">
                            <label>Số người ăn
                                <input type="number" min={menu.minGuests} max={menu.maxGuests} value={guests}
                                    onChange={(event) => setGuests(Math.max(menu.minGuests, Math.min(menu.maxGuests, Number(event.target.value) || menu.minGuests)))} />
                            </label>
                            <label>Ngày dự kiến
                                <input type="date" min={localDate} value={date} onChange={(event) => setDate(event.target.value)} />
                            </label>
                            <label>Giờ dùng bữa
                                <select value={time} onChange={(event) => setTime(event.target.value)}>
                                    <option value="11:30">11:30 – Bữa trưa</option>
                                    <option value="18:30">18:30 – Bữa tối</option>
                                </select>
                            </label>
                        </div>
                        {saved && (
                            <div className="gcp-detail-note" role="status">
                                <CheckCircle /> Bạn đã chọn {menu.name} cho {guests} người{date ? `, ngày ${date}` : ''} lúc {time}.
                                <br />Đây chỉ là lựa chọn trên giao diện; chưa tạo đơn hàng.
                            </div>
                        )}
                        <div className="gcp-detail-bottom">
                            <button className="gcp-btn gcp-btn-light" type="button" onClick={closeModal}>Đóng</button>
                            <button className="gcp-btn gcp-btn-primary" type="button" onClick={prepareSelection}>Xem lựa chọn của tôi</button>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}
