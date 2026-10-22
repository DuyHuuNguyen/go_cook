import { Container } from 'react-bootstrap';
import { Link } from 'react-router';
import { ArrowRight } from 'react-bootstrap-icons';

export default function HomeServices() {
    return (
            <section className="gc-home-section gc-home-service" id="dich-vu">
                <Container>
                    <div className="gc-home-heading gc-home-heading-center">
                        <p className="gc-home-kicker">HAI CÁCH CHỌN BỮA ĂN</p>
                        <h2>Bạn muốn đặt bữa ăn theo cách nào?</h2>
                        <p>Chọn nhanh một mâm cơm có sẵn hoặc tự lên danh sách món phù hợp với nhà mình.</p>
                    </div>
                    <div className="gc-home-service-grid">
                        <article className="gc-home-service-card">
                            <div className="gc-home-service-top">
                                <span className="gc-home-number">01</span>
                                <span>Thực đơn đã chuẩn bị</span>
                            </div>
                            <h3>Chọn thực đơn có sẵn</h3>
                            <p>Tham khảo các mâm cơm gia đình và thực đơn tiệc, xem món ăn, khẩu phần và giá dự kiến.</p>
                            <ul>
                                <li>Xem món ăn trong từng thực đơn</li>
                                <li>Tìm kiếm theo tên món và số khách</li>
                                <li>Chọn bữa ăn phù hợp với gia đình</li>
                            </ul>
                            <div className="gc-home-service-example">
                                <span>Ví dụ: mâm cơm miền Nam 4 người</span>
                                <strong>430.000đ</strong>
                            </div>
                            <Link to="/menus" className="gc-home-btn gc-home-btn-primary">
                                Khám phá thực đơn <ArrowRight size={18} />
                            </Link>
                        </article>
                        <article className="gc-home-service-card gc-home-service-custom">
                            <div className="gc-home-service-top">
                                <span className="gc-home-number">02</span>
                                <span>Tùy chọn theo ý thích</span>
                            </div>
                            <h3>Tự tạo thực đơn</h3>
                            <p>Tự thêm món ăn, chọn khẩu vị, thời gian và dự kiến ngân sách cho bữa ăn riêng của bạn.</p>
                            <ul>
                                <li>Thêm hoặc bỏ món dễ dàng</li>
                                <li>Ghi chú dị ứng và khẩu vị gia đình</li>
                                <li>Kiểm tra yêu cầu trước khi gửi</li>
                            </ul>
                            <div className="gc-home-service-example">
                                <span>Ví dụ: ngân sách dự kiến</span>
                                <strong>600.000–900.000đ</strong>
                            </div>
                            <Link to="/create-menu" className="gc-home-btn gc-home-btn-orange">
                                Bắt đầu tạo thực đơn <ArrowRight size={18} />
                            </Link>
                        </article>
                    </div>
                </Container>
            </section>
    );
}
