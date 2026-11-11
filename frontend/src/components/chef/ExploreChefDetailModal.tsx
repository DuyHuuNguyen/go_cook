import { Badge, Button, Modal } from "react-bootstrap";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle,
  Clock,
  ShieldCheck,
} from "react-bootstrap-icons";
import { Link } from "react-router";
import type { ExploreChefItem } from "../../types/ExploreChefTypes";

interface ExploreChefDetailModalProps {
  chef: ExploreChefItem | null;
  onClose: () => void;
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("vi-VN");
}

export function ExploreChefDetailModal({
  chef,
  onClose,
}: ExploreChefDetailModalProps) {
  if (!chef) return null;

  const initial = (chef.username || "C").charAt(0).toUpperCase();
  const dishes = chef.dishes ?? [];
  const totalBookings = chef.totalBookings ?? 0;
  const successBookings = chef.totalSuccessfullyBookings ?? 0;
  const successRate =
    totalBookings > 0
      ? Math.round((successBookings / totalBookings) * 100)
      : null;

  return (
    <Modal show={Boolean(chef)} onHide={onClose} centered size="lg">
      <Modal.Header closeButton className="border-bottom-0 pb-2">
        <Modal.Title className="d-flex align-items-center gap-3">
          {chef.avatarUrl ? (
            <img
              src={chef.avatarUrl}
              alt={chef.username}
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "2px solid #edf5e7",
              }}
            />
          ) : (
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#376412",
                color: "#fff",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.25rem",
              }}
            >
              {initial}
            </div>
          )}
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="fw-bold">{chef.username}</span>
              <span
                className="d-inline-flex align-items-center gap-1"
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#305c21",
                  background: "#c9ebbb",
                  padding: "2px 8px",
                  borderRadius: "20px",
                }}
              >
                <ShieldCheck size={12} /> Đầu bếp đã duyệt
              </span>
            </div>
            <div className="text-muted small fw-normal d-flex align-items-center gap-3 mt-1">
              <span className="d-inline-flex align-items-center gap-1">
                <Clock size={13} /> {chef.experienceYears ?? 0} năm kinh nghiệm
              </span>
              <span>Gia nhập: {formatDateTime(chef.onboardedAt)}</span>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="pt-2">
        {/* Metrics summary */}
        <div
          className="d-flex flex-wrap gap-3 p-3 rounded mb-3"
          style={{ background: "#faf9f5", border: "1px solid #e5e6dc" }}
        >
          <div className="d-flex align-items-center gap-2 me-3">
            <CalendarCheck size={18} style={{ color: "#376412" }} />
            <div>
              <div className="small text-muted">Tổng đơn nhận</div>
              <strong>{totalBookings} đơn</strong>
            </div>
          </div>
          <div className="d-flex align-items-center gap-2 me-3">
            <CheckCircle size={18} className="text-success" />
            <div>
              <div className="small text-muted">Đơn thành công</div>
              <strong>
                {successBookings} đơn
                {successRate !== null ? ` (${successRate}%)` : ""}
              </strong>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mb-3">
          <h6 className="fw-bold mb-1">Giới thiệu</h6>
          <p className="text-muted mb-0" style={{ whiteSpace: "pre-line" }}>
            {chef.bio?.trim() || "Đầu bếp chưa cập nhật thông tin giới thiệu."}
          </p>
        </div>

        {/* Contact info */}
        {(chef.phone || chef.email) && (
          <div className="mb-3">
            <h6 className="fw-bold mb-1">Thông tin liên hệ</h6>
            <div className="d-flex flex-wrap gap-3 small text-muted">
              {chef.phone && <span>SĐT: {chef.phone}</span>}
              {chef.email && <span>Email: {chef.email}</span>}
            </div>
          </div>
        )}

        {/* Full dish list */}
        <div>
          <h6 className="fw-bold mb-2">
            Danh sách món nấu ({dishes.length})
          </h6>
          {dishes.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {dishes.map((dish) => (
                <Badge
                  key={dish.id}
                  bg="light"
                  text="dark"
                  className="border fw-normal px-2 py-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  {dish.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-muted small mb-0">
              Đầu bếp chưa cập nhật danh sách món ăn.
            </p>
          )}
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top-0">
        <Button variant="outline-secondary" onClick={onClose}>
          Đóng
        </Button>
        <Button
          as={Link as any}
          to="/menus"
          variant="outline-success"
          onClick={onClose}
        >
          Xem thực đơn
        </Button>
        <Button
          as={Link as any}
          to="/create-menu"
          onClick={onClose}
          className="d-inline-flex align-items-center gap-1"
          style={{ backgroundColor: "#376412", borderColor: "#376412" }}
        >
          Tạo yêu cầu đặt nấu <ArrowRight size={14} />
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

