import { Modal } from 'react-bootstrap';
import { Link } from 'react-router';
import { ArrowRight, People, XCircle } from 'react-bootstrap-icons';
import { displayPrice, type CatalogMenu } from './catalogData';
import type { HomeChef } from '../../types/HomeTypes';

interface HomeModalsProps {
    selectedMenu: CatalogMenu | null;
    selectedChef: HomeChef | null;
    onCloseMenu: () => void;
    onCloseChef: () => void;
}

export default function HomeModals({ selectedMenu, selectedChef, onCloseMenu, onCloseChef }: HomeModalsProps) {
    return (
        <>
            <Modal show={selectedMenu !== null} onHide={onCloseMenu} centered size="lg" className="gc-home-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Chi tiết thực đơn</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMenu && (
                        <div className="gc-home-modal-grid">
                            {selectedMenu.imageUrl ? (
                                <img src={selectedMenu.imageUrl} alt={selectedMenu.name} />
                            ) : (
                                <span className="gc-home-image-placeholder">Chưa có ảnh thực đơn</span>
                            )}
                            <div>
                                <small>{selectedMenu.categoryName}</small>
                                <h3>{selectedMenu.name}</h3>
                                <p>{selectedMenu.description || 'Chưa có mô tả thực đơn.'}</p>
                                <h4>Các món trong thực đơn</h4>
                                {selectedMenu.dishes && selectedMenu.dishes.length > 0 ? (
                                    <ul>
                                        {selectedMenu.dishes.map((dish) => <li key={dish}>{dish}</li>)}
                                    </ul>
                                ) : (
                                    <p>Danh sách món chưa được cập nhật.</p>
                                )}
                                <p><People size={17} /> {selectedMenu.minGuests}–{selectedMenu.maxGuests} người ăn</p>
                                <strong>Giá tham khảo: {displayPrice(selectedMenu.referencePrice)}</strong>
                            </div>
                        </div>
                    )}
                    <p className="gc-home-modal-note">Chức năng đặt nấu sẽ được mở khi hệ thống hỗ trợ.</p>
                    <div className="gc-home-modal-actions">
                        <button type="button" className="gc-home-btn gc-home-btn-outline" onClick={onCloseMenu}>
                            <XCircle size={17} /> Đóng
                        </button>
                        <Link to="/menus" className="gc-home-btn gc-home-btn-primary" onClick={onCloseMenu}>
                            Đến trang thực đơn <ArrowRight size={17} />
                        </Link>
                    </div>
                </Modal.Body>
            </Modal>

            <Modal show={selectedChef !== null} onHide={onCloseChef} centered className="gc-home-modal">
                <Modal.Header closeButton>
                    <Modal.Title>Thông tin đầu bếp</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedChef && (
                        <div className="gc-home-chef-modal">
                            {selectedChef.avatarUrl ? (
                                <img src={selectedChef.avatarUrl} alt={`Đầu bếp ${selectedChef.name}`} />
                            ) : (
                                <span className="gc-home-image-placeholder">Chưa có ảnh đầu bếp</span>
                            )}
                            <h3>{selectedChef.name}</h3>
                            <p>{selectedChef.bio || 'Chưa có thông tin giới thiệu.'}</p>
                            <p>Kinh nghiệm: {selectedChef.experienceYears} năm</p>
                        </div>
                    )}
                    <div className="gc-home-modal-actions">
                        <button type="button" className="gc-home-btn gc-home-btn-outline" onClick={onCloseChef}>
                            Đóng
                        </button>
                        <Link to="/menus" className="gc-home-btn gc-home-btn-primary" onClick={onCloseChef}>
                            Khám phá thực đơn <ArrowRight size={17} />
                        </Link>
                    </div>
                </Modal.Body>
            </Modal>
        </>
    );
}
