import { Badge, Button, Card } from "react-bootstrap";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle,
  Clock,
  ShieldCheck,
} from "react-bootstrap-icons";
import { Link } from "react-router";
import type { ExploreChefItem } from "../../types/ExploreChefTypes";

interface ExploreChefCardProps {
  chef: ExploreChefItem;
  onSelect: (chef: ExploreChefItem) => void;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("vi-VN");
}

export function ExploreChefCard({ chef, onSelect }: ExploreChefCardProps) {
  const initial = (chef.username || "C").charAt(0).toUpperCase();
  const dishes = chef.dishes ?? [];
  const visibleDishes = dishes.slice(0, 4);
  const remainingDishCount = Math.max(0, dishes.length - visibleDishes.length);
  const experience = chef.experienceYears ?? 0;

  return (
    <Card
      className="h-100 border-0 shadow-sm"
      style={{
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #e5e6dc",
        transition: "transform 0.16s ease, box-shadow 0.16s ease",
      }}
    >
      {/* Top Banner / Avatar header */}
      <div
        style={{
          background: "linear-gradient(120deg, #edf5e7 0%, #f6f3ea 100%)",
          padding: "18px 20px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          borderBottom: "1px solid #eceee4",
        }}
      >
        {chef.avatarUrl ? (
          <img
            src={chef.avatarUrl}
            alt={`Đầu bếp ${chef.username}`}
            loading="lazy"
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid #fff",
              boxShadow: "0 2px 8px rgba(55, 100, 18, 0.15)",
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "#376412",
              color: "#fff",
              fontSize: "1.4rem",
              fontWeight: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #fff",
              boxShadow: "0 2px 8px rgba(55, 100, 18, 0.15)",
              flexShrink: 0,
            }}
          >
            {initial}
          </div>
        )}

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            className="d-inline-flex align-items-center gap-1 mb-1"
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              color: "#305c21",
              background: "#c9ebbb",
              padding: "2px 8px",
              borderRadius: "20px",
            }}
          >
            <ShieldCheck size={12} />
            Đầu bếp GoCook
          </div>
          <h5
            className="mb-1 text-truncate"
            style={{ fontWeight: 700, color: "#1c1c17", fontSize: "1.08rem" }}
            title={chef.username}
          >
            {chef.username}
          </h5>
          <div
            className="d-flex align-items-center gap-1 text-muted"
            style={{ fontSize: "0.82rem" }}
          >
            <Clock size={13} />
            <span>{experience} năm kinh nghiệm</span>
          </div>
        </div>
      </div>

      <Card.Body className="d-flex flex-column p-3">
        {/* Bio */}
        <p
          className="text-muted mb-3"
          style={{
            fontSize: "0.88rem",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: "3.9em",
          }}
        >
          {chef.bio?.trim() || "Đầu bếp tại gia giàu tâm huyết trên GoCook."}
        </p>

        {/* Booking stats */}
        <div
          className="d-flex justify-content-between align-items-center mb-3 p-2 rounded"
          style={{
            background: "#faf9f5",
            border: "1px solid #ecebe2",
            fontSize: "0.82rem",
          }}
        >
          <div className="d-flex align-items-center gap-1" title="Tổng số đơn đã nhận">
            <CalendarCheck size={14} style={{ color: "#376412" }} />
            <span>
              <strong>{chef.totalBookings ?? 0}</strong> đơn
            </span>
          </div>
          <div
            className="d-flex align-items-center gap-1"
            title="Số đơn hoàn thành / chấp nhận"
          >
            <CheckCircle size={14} className="text-success" />
            <span>
              <strong>{chef.totalSuccessfullyBookings ?? 0}</strong> thành công
            </span>
          </div>
          <div className="text-muted" title="Ngày tham gia">
            {formatDate(chef.onboardedAt)}
          </div>
        </div>

        {/* Dishes */}
        <div className="mb-3 flex-grow-1">
          <div
            style={{
              fontSize: "0.78rem",
              fontWeight: 600,
              color: "#65695e",
              marginBottom: "6px",
              textTransform: "uppercase",
              letterSpacing: "0.4px",
            }}
          >
            Món sở trường ({dishes.length})
          </div>
          {dishes.length > 0 ? (
            <div className="d-flex flex-wrap gap-1">
              {visibleDishes.map((dish) => (
                <Badge
                  key={dish.id}
                  bg="light"
                  text="dark"
                  className="border fw-normal"
                  style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                >
                  {dish.name}
                </Badge>
              ))}
              {remainingDishCount > 0 && (
                <Badge
                  bg="secondary"
                  className="fw-normal"
                  style={{ fontSize: "0.78rem", padding: "4px 8px" }}
                >
                  +{remainingDishCount} món
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted small">Chưa cập nhật danh sách món.</span>
          )}
        </div>

        {/* Actions */}
        <div className="d-flex gap-2 pt-2 border-top">
          <Button
            as={Link as any}
            to={`/explore-chefs/${chef.userId}`}
            variant="outline-success"
            size="sm"
            className="flex-grow-1"
            style={{ borderRadius: "10px", fontWeight: 600 }}
          >
            Xem chi tiết
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            style={{ borderRadius: "10px", fontWeight: 600 }}
            onClick={() => onSelect(chef)}
          >
            Xem nhanh
          </Button>
          <Button
            as={Link as any}
            to="/create-menu"
            size="sm"
            className="d-inline-flex align-items-center justify-content-center gap-1 flex-grow-1"
            style={{
              borderRadius: "10px",
              fontWeight: 600,
              backgroundColor: "#376412",
              borderColor: "#376412",
            }}
          >
            Đặt nấu <ArrowRight size={14} />
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}

