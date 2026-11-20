import { useMemo, useState } from "react";
import { Alert, Button, Col, Container, Form, Row, Spinner } from "react-bootstrap";
import { ArrowClockwise, ArrowRight, Search } from "react-bootstrap-icons";
import { Link } from "react-router";
import { useExploreChef } from "../../contexts/ExploreChefContext";
import type { ExploreChefItem } from "../../types/ExploreChefTypes";
import { ExploreChefCard } from "./ExploreChefCard";
import { ExploreChefDetailModal } from "./ExploreChefDetailModal";
import "../../styles/menuPages.css";

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function ExploreChefsList() {
  const { chefs, hasNext, loading, error, loadMoreChefs, refreshChefs } =
    useExploreChef();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChef, setSelectedChef] = useState<ExploreChefItem | null>(null);

  const filteredChefs = useMemo(() => {
    const q = normalizeText(searchQuery);
    if (!q) return chefs;
    return chefs.filter((chef) => {
      const dishNames = (chef.dishes ?? []).map((d) => d.name).join(" ");
      const searchable = `${chef.username} ${chef.bio ?? ""} ${dishNames}`;
      return normalizeText(searchable).includes(q);
    });
  }, [chefs, searchQuery]);

  return (
    <div className="gcp-page" style={{ minHeight: "80vh" }}>
      {/* Hero section matching GoCook catalog pages */}
      <section className="gcp-hero">
        <Container>
          <nav className="gcp-breadcrumb" aria-label="Điều hướng">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>Khám phá đầu bếp</span>
          </nav>

          <span className="gcp-hero-kicker">
            Đội ngũ đầu bếp GoCook · Đã được xét duyệt &amp; kiểm chứng
          </span>

          <div className="gcp-hero-content">
            <div>
              <h1>Khám Phá Các Đầu Bếp Tại Gia Tâm Huyết</h1>
              <p>
                Tìm hiểu hồ sơ, kinh nghiệm, số đơn đã phục vụ và những món ăn sở
                trường của từng đầu bếp trước khi đặt nấu cho gia đình bạn.
              </p>
            </div>
            <Link to="/create-menu" className="gcp-hero-promo">
              <strong>Bạn đã có món muốn nấu?</strong>
              <span>
                Tạo yêu cầu đặt bếp riêng để hệ thống gợi ý các đầu bếp phù hợp
                nhất gần bạn.
              </span>
              <b>
                Tạo yêu cầu ngay <ArrowRight />
              </b>
            </Link>
          </div>
        </Container>
      </section>

      {/* Main list section */}
      <Container className="py-4">
        {/* Filter & Refresh toolbar */}
        <div
          className="d-flex justify-content-between align-items-center flex-wrap gap-3 p-3 mb-4 bg-white rounded-4 border"
          style={{ borderColor: "#e5e6dc" }}
        >
          <div className="d-flex align-items-center gap-2 flex-grow-1" style={{ maxWidth: "420px" }}>
            <div className="position-relative w-100">
              <Search
                size={15}
                className="position-absolute text-muted"
                style={{ top: "50%", left: "12px", transform: "translateY(-50%)" }}
              />
              <Form.Control
                type="search"
                placeholder="Tìm đầu bếp theo tên, giới thiệu hoặc món nấu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ paddingLeft: "36px", borderRadius: "10px" }}
              />
            </div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small">
              Đang hiển thị <strong>{filteredChefs.length}</strong> đầu bếp
            </span>
            <Button
              variant="outline-success"
              size="sm"
              disabled={loading}
              onClick={() => void refreshChefs()}
              className="d-inline-flex align-items-center gap-1"
              style={{ borderRadius: "10px", fontWeight: 600 }}
            >
              <ArrowClockwise size={14} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <Alert
            variant="danger"
            className="d-flex justify-content-between align-items-center"
          >
            <span>{error}</span>
            <Button
              variant="outline-danger"
              size="sm"
              onClick={() => void refreshChefs()}
            >
              Thử lại
            </Button>
          </Alert>
        )}

        {/* Initial Loading */}
        {loading && chefs.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border">
            <Spinner animation="border" variant="success" />
            <div className="mt-2 text-muted">Đang tải danh sách đầu bếp...</div>
          </div>
        ) : filteredChefs.length === 0 ? (
          <div className="text-center py-5 bg-white rounded-4 border">
            <h5 className="fw-bold mb-2">Không tìm thấy đầu bếp phù hợp</h5>
            <p className="text-muted mb-3">
              {searchQuery.trim()
                ? "Hãy thử từ khóa khác hoặc tải thêm đầu bếp."
                : "Hiện chưa có đầu bếp nào được hiển thị."}
            </p>
            <div className="d-flex justify-content-center gap-2">
              {searchQuery.trim() && (
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                >
                  Xóa bộ lọc
                </Button>
              )}
              <Button
                variant="success"
                size="sm"
                onClick={() => void refreshChefs()}
              >
                Làm mới
              </Button>
            </div>
          </div>
        ) : (
          <>
            <Row className="g-4">
              {filteredChefs.map((chef) => (
                <Col xs={12} md={6} lg={4} key={chef.userId}>
                  <ExploreChefCard chef={chef} onSelect={setSelectedChef} />
                </Col>
              ))}
            </Row>

            {/* Keyset Pagination Load More footer */}
            <div className="text-center mt-5">
              {hasNext ? (
                <Button
                  variant="outline-success"
                  disabled={loading}
                  onClick={() => void loadMoreChefs()}
                  style={{
                    borderRadius: "12px",
                    padding: "10px 28px",
                    fontWeight: 600,
                  }}
                >
                  {loading ? (
                    <>
                      <Spinner
                        as="span"
                        animation="border"
                        size="sm"
                        className="me-2"
                      />
                      Đang tải thêm...
                    </>
                  ) : (
                    "Tải thêm đầu bếp"
                  )}
                </Button>
              ) : (
                <p className="text-muted small mb-0">
                  Đã hiển thị tất cả đầu bếp hiện có
                </p>
              )}
            </div>
          </>
        )}
      </Container>

      <ExploreChefDetailModal
        chef={selectedChef}
        onClose={() => setSelectedChef(null)}
      />
    </div>
  );
}

