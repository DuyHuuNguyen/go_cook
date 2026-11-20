import { Button, Card } from "react-bootstrap";
import {
  ArrowRight,
  CalendarCheck,
  CheckCircle,
  Envelope,
  ShieldCheck,
  Shop,
  Telephone,
} from "react-bootstrap-icons";
import { Link } from "react-router";
import type { ExploreChefDetail } from "../../../types/ExploreChefTypes";

interface ChefDetailSidebarProps {
  chef: ExploreChefDetail;
}

export function ChefDetailSidebar({ chef }: ChefDetailSidebarProps) {
  const completionRate =
    chef.totalBookings > 0
      ? Math.round((chef.totalSuccessfullyBookings / chef.totalBookings) * 100)
      : null;

  return (
    <Card
      className="border shadow-sm mdd-booking-sticky"
      style={{ borderRadius: "20px", borderColor: "#e3e6da" }}
    >
      <Card.Body className="p-4">
        <div className="d-flex align-items-center gap-2 mb-3">
          <ShieldCheck size={20} className="text-success" />
          <h3 className="mb-0" style={{ fontSize: "1.1rem", fontWeight: 700 }}>
            Tổng quan & Đặt nấu
          </h3>
        </div>

        {/* Performance metrics */}
        <div
          className="p-3 rounded-4 mb-3"
          style={{ backgroundColor: "#f7f9f4", border: "1px solid #e7ece0" }}
        >
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="small text-muted d-inline-flex align-items-center gap-2">
              <CalendarCheck size={14} className="text-success" />
              Tổng lượt đặt nấu
            </span>
            <strong style={{ color: "#1e2519" }}>{chef.totalBookings}</strong>
          </div>
          <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
            <span className="small text-muted d-inline-flex align-items-center gap-2">
              <CheckCircle size={14} className="text-success" />
              Hoàn thành thành công
            </span>
            <strong style={{ color: "#376412" }}>
              {chef.totalSuccessfullyBookings}
              {completionRate !== null ? ` (${completionRate}%)` : ""}
            </strong>
          </div>
          <div className="d-flex justify-content-between align-items-center pt-2">
            <span className="small text-muted d-inline-flex align-items-center gap-2">
              <Shop size={14} className="text-success" />
              Thực đơn đang mở
            </span>
            <strong style={{ color: "#1e2519" }}>{chef.totalMenus}</strong>
          </div>
        </div>

        {/* Contact info */}
        {(chef.phone || chef.email) && (
          <div
            className="p-3 rounded-4 mb-4"
            style={{ backgroundColor: "#fafaf6", border: "1px solid #ebe9df" }}
          >
            <div
              className="small fw-semibold mb-2"
              style={{ color: "#4e5645" }}
            >
              Thông tin liên hệ đầu bếp
            </div>
            {chef.phone && (
              <div className="small d-flex align-items-center gap-2 mb-1 text-dark">
                <Telephone size={13} className="text-success flex-shrink-0" />
                <span>{chef.phone}</span>
              </div>
            )}
            {chef.email && (
              <div className="small d-flex align-items-center gap-2 text-dark text-break">
                <Envelope size={13} className="text-success flex-shrink-0" />
                <span>{chef.email}</span>
              </div>
            )}
          </div>
        )}

        {/* Primary CTA */}
        <div className="d-grid gap-2">
          <Button
            as={Link as any}
            to="/create-menu"
            size="lg"
            className="d-inline-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: "12px",
              fontWeight: 700,
              fontSize: "0.96rem",
              backgroundColor: "#376412",
              borderColor: "#376412",
            }}
          >
            Đặt nấu theo yêu cầu <ArrowRight size={15} />
          </Button>
          <Button
            as={Link as any}
            to="/menus"
            variant="outline-success"
            className="d-inline-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: "12px",
              fontWeight: 600,
              fontSize: "0.92rem",
            }}
          >
            Khám phá tất cả thực đơn
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
