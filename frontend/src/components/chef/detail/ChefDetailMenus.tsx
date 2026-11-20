import { Badge, Button, Card, Col, Row } from "react-bootstrap";
import { ArrowRight, Book, People, Shop } from "react-bootstrap-icons";
import { Link } from "react-router";
import type { ExploreChefMenuItem } from "../../../types/ExploreChefTypes";

interface ChefDetailMenusProps {
  menus: ExploreChefMenuItem[];
  chefName: string;
}

function formatPriceVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function ChefDetailMenus({ menus, chefName }: ChefDetailMenusProps) {
  return (
    <Card
      className="border shadow-sm"
      style={{ borderRadius: "18px", borderColor: "#ebe9df" }}
    >
      <Card.Body className="p-4">
        <div className="mdd-section">
          <h3>
            <Shop size={19} className="text-success" />
            Thực đơn nổi bật của {chefName} ({menus.length})
          </h3>

          {menus.length > 0 ? (
            <Row className="g-3">
              {menus.map((menu) => {
                const coverImage = menu.imageUrls?.[0];
                const visibleDishes = (menu.dishes ?? []).slice(0, 3);
                const extraDishes = Math.max(
                  0,
                  (menu.dishes?.length ?? 0) - visibleDishes.length,
                );

                return (
                  <Col key={menu.id} md={6}>
                    <Card
                      className="h-100 border"
                      style={{
                        borderRadius: "14px",
                        overflow: "hidden",
                        borderColor: "#e6e8dd",
                      }}
                    >
                      {coverImage ? (
                        <img
                          src={coverImage}
                          alt={menu.name}
                          loading="lazy"
                          style={{
                            width: "100%",
                            height: "156px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          className="d-flex flex-column align-items-center justify-content-center"
                          style={{
                            height: "156px",
                            background:
                              "linear-gradient(120deg, #edf5e7 0%, #f7f4eb 100%)",
                            color: "#4a6c31",
                          }}
                        >
                          <Book size={28} />
                          <span className="small mt-1 fw-medium">
                            Thực đơn GoCook
                          </span>
                        </div>
                      )}

                      <Card.Body className="d-flex flex-column p-3">
                        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
                          <Badge
                            bg="light"
                            text="dark"
                            className="border fw-medium"
                            style={{ fontSize: "0.74rem" }}
                          >
                            {menu.category?.name ?? "Ẩm thực gia đình"}
                          </Badge>
                          <span
                            className="fw-bold"
                            style={{ color: "#376412", fontSize: "0.95rem" }}
                          >
                            {formatPriceVnd(menu.tempPrice)}
                          </span>
                        </div>

                        <h4
                          className="mb-1"
                          style={{
                            fontSize: "1.02rem",
                            fontWeight: 700,
                            color: "#1e2519",
                          }}
                        >
                          {menu.name}
                        </h4>

                        {menu.description && (
                          <p
                            className="text-muted small mb-2"
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {menu.description}
                          </p>
                        )}

                        <div className="d-flex align-items-center gap-1 small text-muted mb-2">
                          <People size={13} className="text-success" />
                          Phục vụ {menu.minGuests}–{menu.maxGuests} khách
                        </div>

                        {visibleDishes.length > 0 && (
                          <div className="d-flex flex-wrap gap-1 mb-3">
                            {visibleDishes.map((dish) => (
                              <Badge
                                key={dish.id}
                                bg="light"
                                text="dark"
                                className="border fw-normal"
                                style={{ fontSize: "0.73rem" }}
                              >
                                {dish.name}
                              </Badge>
                            ))}
                            {extraDishes > 0 && (
                              <Badge
                                bg="secondary"
                                className="fw-normal"
                                style={{ fontSize: "0.73rem" }}
                              >
                                +{extraDishes} món
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="mt-auto pt-2 border-top">
                          <Button
                            as={Link as any}
                            to={`/menus/${menu.id}`}
                            variant="outline-success"
                            size="sm"
                            className="w-100 d-inline-flex align-items-center justify-content-center gap-1"
                            style={{ borderRadius: "10px", fontWeight: 600 }}
                          >
                            Xem thực đơn <ArrowRight size={13} />
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          ) : (
            <p className="text-muted small mb-0">
              Đầu bếp hiện chưa công khai thực đơn sẵn có. Bạn có thể tạo yêu cầu
              đặt nấu riêng với các món sở trường của đầu bếp.
            </p>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}
