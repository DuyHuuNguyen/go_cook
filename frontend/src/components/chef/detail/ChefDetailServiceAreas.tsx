import { Badge, Card } from "react-bootstrap";
import { GeoAlt } from "react-bootstrap-icons";
import type { ExploreChefServiceArea } from "../../../types/ExploreChefTypes";

interface ChefDetailServiceAreasProps {
  serviceAreas: ExploreChefServiceArea[];
}

export function ChefDetailServiceAreas({
  serviceAreas,
}: ChefDetailServiceAreasProps) {
  return (
    <Card
      className="border shadow-sm"
      style={{ borderRadius: "18px", borderColor: "#ebe9df" }}
    >
      <Card.Body className="p-4">
        <div className="mdd-section">
          <h3>
            <GeoAlt size={19} className="text-success" />
            Khu vực nhận nấu ({serviceAreas.length})
          </h3>

          {serviceAreas.length > 0 ? (
            <div className="d-flex flex-wrap gap-2">
              {serviceAreas.map((area, index) => {
                const label = area.wardName
                  ? `${area.wardName}, ${area.provinceName}`
                  : area.provinceName;
                return (
                  <Badge
                    key={`${area.provinceCode}-${area.wardCode ?? "all"}-${index}`}
                    bg="light"
                    text="dark"
                    className="border d-inline-flex align-items-center gap-1 fw-medium"
                    style={{
                      fontSize: "0.85rem",
                      padding: "8px 13px",
                      borderRadius: "12px",
                      backgroundColor: "#f5f8f2",
                      borderColor: "#d9e4cf",
                    }}
                  >
                    <GeoAlt size={12} className="text-success" />
                    {label}
                  </Badge>
                );
              })}
            </div>
          ) : (
            <p className="text-muted small mb-0">
              Đầu bếp nhận phục vụ linh hoạt theo lịch đặt nấu trong khu vực hoạt
              động.
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

