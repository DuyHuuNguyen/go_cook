import {
  Calendar3,
  CheckCircleFill,
  GeoAlt,
  People,
} from "react-bootstrap-icons";
import type { MenuRequestDraft, SelectedDish } from "../../types/BookingTypes";

interface RequestSummaryProps {
  draft: MenuRequestDraft;
  selectedDishes: SelectedDish[];
  message: string;
  onCreateBooking: () => void;
  submitting: boolean;
}

export default function RequestSummary({
  draft,
  selectedDishes,
  message,
  onCreateBooking,
  submitting,
}: RequestSummaryProps) {
  return (
    <aside className="gcm-summary">
      <div className="gcm-summary-card">
        <div className="gcm-summary-title">
          <span>TÓM TẮT YÊU CẦU</span>
        </div>

        <div className="gcm-summary-item">
          <strong>
            <CheckCircleFill /> {selectedDishes.length} món đã chọn
          </strong>

          {selectedDishes.length > 0 ? (
            <ul>
              {selectedDishes.map((dish) => (
                <li key={dish.dishId}>
                  {dish.dishName} × {dish.quantity}
                </li>
              ))}
            </ul>
          ) : (
            <p>Chưa có món ăn nào</p>
          )}
        </div>

        <div className="gcm-summary-item">
          <strong>
            <People /> {draft.adults} người ăn
          </strong>
        </div>

        <div className="gcm-summary-item">
          <strong>
            <Calendar3 /> {draft.mealDate || "Chưa chọn ngày"}
          </strong>
          <p>
            {draft.mealTime || "Chưa chọn giờ"} ·{" "}
            {draft.mealDate ? "Giờ dự kiến" : "Chọn lịch dùng bữa"}
          </p>
        </div>

        <div className="gcm-summary-item">
          <strong>
            <GeoAlt /> Địa điểm
          </strong>
          <p>{draft.address || "Chưa nhập địa chỉ"}</p>
        </div>

        {draft.notes.trim() && (
          <div className="gcm-summary-item">
            <strong>Ghi chú</strong>
            <p>{draft.notes}</p>
          </div>
        )}

        {message && (
          <div className="gcm-warning" role="alert">
            {message}
          </div>
        )}

        <button
          type="button"
          className="gcm-primary-button"
          onClick={onCreateBooking}
          disabled={submitting}
        >
          {submitting ? "Đang tạo yêu cầu nấu ăn..." : "Tạo Yêu Cầu Nấu Ăn"}
        </button>

        {message && (
          <p className="gcm-mobile-message" role="alert">
            {message}
          </p>
        )}
      </div>

      <div className="gcm-side-tips">
        <h3>Quyền lợi khi đặt qua GoCook</h3>
        <p>
          <CheckCircleFill /> Trao đổi khẩu vị với đầu bếp trước khi xác nhận.
        </p>
        <p>
          <CheckCircleFill /> Thống nhất giá và số lượng món ăn.
        </p>
        <p>
          <CheckCircleFill /> Chủ động lựa chọn thời gian phục vụ.
        </p>
      </div>
    </aside>
  );
}
