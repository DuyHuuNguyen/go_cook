import { Badge, Card } from "react-bootstrap";
import { Award, JournalText, ListUl } from "react-bootstrap-icons";
import type { ExploreChefDetail } from "../../../types/ExploreChefTypes";

interface ChefDetailBioAndSkillsProps {
  chef: ExploreChefDetail;
}

export function ChefDetailBioAndSkills({ chef }: ChefDetailBioAndSkillsProps) {
  const dishes = chef.dishes ?? [];

  return (
    <div className="d-flex flex-column gap-4">
      <Card
        className="border shadow-sm"
        style={{ borderRadius: "18px", borderColor: "#ebe9df" }}
      >
        <Card.Body className="p-4">
          <div className="mdd-section">
            <h3>
              <JournalText size={19} className="text-success" />
              Giới thiệu & Phong cách ẩm thực
            </h3>
            <p className="mdd-description mb-0" style={{ whiteSpace: "pre-line" }}>
              {chef.bio?.trim()
                ? chef.bio
                : "Đầu bếp đối tác của GoCook, sẵn sàng chuẩn bị bữa ăn chất lượng, an toàn và chu đáo ngay tại gian bếp của gia đình bạn."}
            </p>
            {chef.reviewReason?.trim() && (
              <div
                className="mt-3 p-3 rounded-3"
                style={{
                  backgroundColor: "#f7faf4",
                  border: "1px solid #ddecce",
                }}
              >
                <div
                  className="fw-semibold small mb-1"
                  style={{ color: "#2f5a1f" }}
                >
                  Đánh giá hồ sơ chuyên môn
                </div>
                <div className="small" style={{ color: "#4f5946" }}>
                  {chef.reviewReason}
                </div>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>

      <Card
        className="border shadow-sm"
        style={{ borderRadius: "18px", borderColor: "#ebe9df" }}
      >
        <Card.Body className="p-4">
          <div className="mdd-section">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h3 className="mb-0">
                <ListUl size={19} className="text-success" />
                Món ăn sở trường & Kỹ năng bếp ({dishes.length})
              </h3>
            </div>

            {dishes.length > 0 ? (
              <div className="d-flex flex-wrap gap-2">
                {dishes.map((dish) => (
                  <Badge
                    key={dish.id}
                    bg="light"
                    text="dark"
                    className="border d-inline-flex align-items-center gap-1 fw-medium"
                    style={{
                      fontSize: "0.86rem",
                      padding: "8px 14px",
                      borderRadius: "999px",
                      backgroundColor: "#fafbf8",
                      borderColor: "#dde3d5",
                    }}
                  >
                    <Award size={13} className="text-success" />
                    {dish.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-muted small mb-0">
                Đầu bếp đang cập nhật thêm danh sách món ăn sở trường.
              </p>
            )}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
}

