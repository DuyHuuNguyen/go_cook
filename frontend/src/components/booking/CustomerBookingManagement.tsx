import { Alert, Badge, Button, Card, Col, Row, Spinner } from "react-bootstrap";
import { Link } from "react-router";
import BookingProvider, { useBooking } from "../../contexts/BookingContext";

const STATUS_BADGE: Record<string, { bg: string; label: string }> = {
  PENDING: { bg: "warning", label: "Chờ xử lý" },
  MATCHING: { bg: "info", label: "Đang tìm đầu bếp" },
  CONFIRMED: { bg: "primary", label: "Đã xác nhận" },
  COMPLETED: { bg: "success", label: "Hoàn thành" },
  CANCELLED: { bg: "danger", label: "Đã hủy" },
};

function formatDateTime(value: string | number) {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleString("vi-VN");
}

function CustomerBookingChild() {
  const {
    bookings,
    page,
    totalPages,
    totalElements,
    hasNext,
    hasPrevious,
    loading,
    error,
    setPage,
    refreshBookings,
  } = useBooking();

  return (
    <div className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1">Đơn đặt bếp của tôi</h4>
          <small className="text-muted">Tổng cộng: {totalElements} đơn</small>
        </div>
        <div className="d-flex gap-2">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={loading}
            onClick={() => void refreshBookings()}
          >
            Làm mới
          </Button>
          <Button as={Link as any} to="/create-menu" variant="success" size="sm">
            + Tạo đơn mới
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="danger" className="d-flex justify-content-between align-items-center">
          <span>{error}</span>
          <Button variant="outline-danger" size="sm" onClick={() => void refreshBookings()}>
            Thử lại
          </Button>
        </Alert>
      )}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <div className="mt-2 text-muted">Đang tải danh sách đơn...</div>
        </div>
      ) : bookings.length === 0 ? (
        <Card className="border-0 shadow-sm text-center py-5">
          <Card.Body>
            <p className="text-muted mb-3">Bạn chưa có đơn đặt bếp nào.</p>
            <Button as={Link as any} to="/create-menu" variant="success">
              Tạo yêu cầu nấu ăn ngay
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-3">
          {bookings.map((booking) => {
            const status = STATUS_BADGE[booking.bookingStatus] ?? {
              bg: "secondary",
              label: booking.bookingStatus || "Không rõ",
            };

            return (
              <Col xs={12} key={booking.id}>
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                      <div>
                        <span className="fw-bold me-2">
                          #{booking.bookingCode || booking.id}
                        </span>
                        <Badge bg={status.bg}>{status.label}</Badge>
                      </div>
                      <small className="text-muted">
                        Tạo lúc: {formatDateTime(booking.createdAt)}
                      </small>
                    </div>

                    <Row className="g-2 mb-3 small">
                      <Col xs={12} md={6}>
                        <div>
                          <strong>Thời gian phục vụ:</strong>{" "}
                          {formatDateTime(booking.scheduledAt)}
                        </div>
                        <div>
                          <strong>Số khách:</strong> {booking.guestCount} người
                        </div>
                        <div>
                          <strong>Tổng tiền:</strong>{" "}
                          <span className="text-success fw-semibold">
                            {(booking.totalAmount ?? 0).toLocaleString("vi-VN")} đ
                          </span>
                        </div>
                      </Col>
                      <Col xs={12} md={6}>
                        <div>
                          <strong>Địa chỉ:</strong> {booking.serviceAddress || "—"}
                        </div>
                        {booking.customerNote && (
                          <div>
                            <strong>Ghi chú:</strong> {booking.customerNote}
                          </div>
                        )}
                      </Col>
                    </Row>

                    {booking.dishes?.length > 0 && (
                      <div className="mb-3">
                        <small className="fw-semibold d-block mb-1">
                          Danh sách món ăn ({booking.dishes.length}):
                        </small>
                        <div className="d-flex flex-wrap gap-2">
                          {booking.dishes.map((dish) => (
                            <Badge
                              key={dish.dishId}
                              bg="light"
                              text="dark"
                              className="border fw-normal px-2 py-1"
                            >
                              {dish.dishName} × {dish.quantity}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="d-flex justify-content-end gap-2">
                      {booking.chefId && (
                        <Button
                          as={Link as any}
                          to={`/chat?bookingId=${booking.id}`}
                          state={{ bookingId: booking.id, chefId: booking.chefId }}
                          variant="outline-primary"
                          size="sm"
                        >
                          Nhắn tin đầu bếp
                        </Button>
                      )}
                      <Button
                        as={Link as any}
                        to={`/bookings/${booking.id}/matching-chefs`}
                        variant="outline-success"
                        size="sm"
                      >
                        Tìm đầu bếp phù hợp
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center gap-3 mt-4">
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={!hasPrevious || loading || page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Trang trước
          </Button>
          <span className="small">
            Trang <strong>{page}</strong> / {totalPages}
          </span>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={!hasNext || loading}
            onClick={() => setPage(page + 1)}
          >
            Trang sau
          </Button>
        </div>
      )}
    </div>
  );
}

export default function CustomerBookingManagementView() {
  return (
    <BookingProvider>
      <CustomerBookingChild />
    </BookingProvider>
  );
}

