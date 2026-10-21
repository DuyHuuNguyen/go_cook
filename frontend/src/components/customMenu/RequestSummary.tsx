import { ArrowRight, Calendar3, CheckCircleFill, GeoAlt, People } from 'react-bootstrap-icons';
import type { MenuRequestDraft } from '../../types/MenuRequestTypes';
import { displayPrice } from '../home/catalogData';

interface RequestSummaryProps {
    draft: MenuRequestDraft;
    message: string;
    onPreview: () => void;
}

export default function RequestSummary({ draft, message, onPreview }: RequestSummaryProps) {
    return (
        <aside className="gcm-summary">
            <div className="gcm-summary-card">
                <div className="gcm-summary-title">
                    <span>TÓM TẮT YÊU CẦU</span>
                    <span className="gcm-summary-status">Đang soạn</span>
                </div>
                <div className="gcm-summary-item">
                    <div><strong><CheckCircleFill /> {draft.dishes.length} món đã chọn</strong></div>
                    <p>{draft.dishes.length ? draft.dishes.join(', ') : 'Chưa có món ăn nào'}</p>
                </div>
                <div className="gcm-summary-item">
                    <strong><People /> {draft.adults + draft.children} người ăn</strong>
                    <p>{draft.adults} người lớn · {draft.children} trẻ em</p>
                </div>
                <div className="gcm-summary-item">
                    <strong><Calendar3 /> {draft.mealDate || 'Chưa chọn ngày'}</strong>
                    <p>{draft.mealTime} · {draft.mealDate ? 'Giờ dự kiến' : 'Chọn lịch dùng bữa'}</p>
                </div>
                <div className="gcm-summary-item">
                    <strong><GeoAlt /> Địa điểm</strong>
                    <p>{draft.address || 'Chưa nhập địa chỉ'}</p>
                </div>
                <div className="gcm-summary-budget">
                    <span>Ngân sách dự kiến</span>
                    <strong>{displayPrice(draft.minBudget)} – {displayPrice(draft.maxBudget)}</strong>
                    <small>Chưa bao gồm giá được xác nhận từ đầu bếp</small>
                </div>
                {message && <div className="gcm-warning" role="alert">{message}</div>}
                <button className="gcm-primary-button" type="button" onClick={onPreview}>
                    Xem trước yêu cầu <ArrowRight />
                </button>
                <p className="gcm-summary-disclaimer">Chưa gửi yêu cầu đến đầu bếp. Chức năng gửi sẽ hoạt động khi Backend hoàn thành.</p>
            </div>
            <div className="gcm-side-tips">
                <h3>Quyền lợi khi đặt qua GoCook</h3>
                <p><CheckCircleFill /> Trao đổi khẩu vị với đầu bếp trước khi xác nhận.</p>
                <p><CheckCircleFill /> Thống nhất ngân sách và số lượng món ăn.</p>
                <p><CheckCircleFill /> Tự chủ động lựa chọn thời gian phục vụ.</p>
            </div>
        </aside>
    );
}
