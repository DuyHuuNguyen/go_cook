import { Badge } from "react-bootstrap";
import {
  Award,
  CalendarCheck,
  CheckCircle,
  ChevronRight,
  Clock,
  ShieldCheck,
} from "react-bootstrap-icons";
import { Link } from "react-router";
import type { ExploreChefDetail } from "../../../types/ExploreChefTypes";

interface ChefDetailHeroProps {
  chef: ExploreChefDetail;
}

function formatOnboardDate(value: string | null): string {
  if (!value) return "Đang cập nhật";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Đang cập nhật"
    : date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
}

export function ChefDetailHero({ chef }: ChefDetailHeroProps) {
  const initial = (chef.username || "C").charAt(0).toUpperCase();
  const experience = chef.experienceYears ?? 0;

  return (
    <div className="mb-4">
      <nav className="mdd-breadcrumb" aria-label="Breadcrumb">
        <Link to="/">Trang chủ</Link>
        <ChevronRight className="mdd-breadcrumb-sep" size={10} />
        <Link to="/explore-chefs">Khám phá đầu bếp</Link>
        <ChevronRight className="mdd-breadcrumb-sep" size={10} />
        <span aria-current="page">{chef.username}</span>
      </nav>

      <div
        className="p-4 p-md-5 rounded-4 border shadow-sm"
        style={{
          background:
            "linear-gradient(135deg, #edf5e7 0%, #f8f6ee 55%, #ffffff 100%)",
          borderColor: "#e4e6da",
        }}
      >
        <div className="d-flex flex-column flex-md-row align-items-md-center gap-4">
          {chef.avatarUrl ? (
            <img
              src={chef.avatarUrl}
              alt={`Đầu bếp ${chef.username}`}
              style={{
                width: "104px",
                height: "104px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #ffffff",
                boxShadow: "0 6px 18px rgba(55, 100, 18, 0.16)",
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: "104px",
                height: "104px",
                borderRadius: "50%",
                background: "#376412",
                color: "#ffffff",
                fontSize: "2.3rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "3px solid #ffffff",
                boxShadow: "0 6px 18px rgba(55, 100, 18, 0.16)",
                flexShrink: 0,
              }}
            >
              {initial}
            </div>
          )}

          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
              <Badge
                bg="success"
                className="d-inline-flex align-items-center gap-1 rounded-pill px-3 py-2 fw-semibold"
                style={{
                  backgroundColor: "#c9ebbb",
                  color: "#2c551d",
                  fontSize: "0.78rem",
                }}
              >
                <ShieldCheck size={13} />
                Đầu bếp GoCook đã xác minh
              </Badge>
              {chef.totalSuccessfullyBookings > 0 && (
                <Badge
                  bg="light"
                  text="dark"
                  className="border rounded-pill px-3 py-2 fw-medium"
                  style={{ fontSize: "0.78rem" }}
                >
                  <CheckCircle size={12} className="text-success me-1" />
                  Đã hoàn thành {chef.totalSuccessfullyBookings} đơn nấu
                </Badge>
              )}
            </div>

            <h1
              className="mb-2"
              style={{
                fontSize: "clamp(1.6rem, 2.8vw, 2.2rem)",
                fontWeight: 800,
                color: "#1e2519",
              }}
            >
              Đầu bếp {chef.username}
            </h1>

            <div
              className="d-flex flex-wrap align-items-center gap-3 gap-md-4 small"
              style={{ color: "#4e5645" }}
            >
              <span className="d-inline-flex align-items-center gap-1 fw-medium">
                <Clock size={14} className="text-success" />
                {experience > 0
                  ? `${experience} năm kinh nghiệm`
                  : "Đầu bếp đối tác mới"}
              </span>
              <span className="d-inline-flex align-items-center gap-1 fw-medium">
                <CalendarCheck size={14} className="text-success" />
                Gia nhập từ {formatOnboardDate(chef.onboardedAt)}
              </span>
              <span className="d-inline-flex align-items-center gap-1 fw-medium">
                <Award size={14} className="text-success" />
                {chef.dishes?.length ?? 0} món sở trường • {chef.totalMenus ?? 0}{" "}
                thực đơn
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

