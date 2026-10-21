import { Container } from 'react-bootstrap';
import { CalendarCheck, Check2Circle, People, ShieldCheck } from 'react-bootstrap-icons';

export default function HomeBenefits() {
    return (
            <section className="gc-home-section gc-home-benefits">
                <Container>
                    <div className="gc-home-heading gc-home-heading-center">
                        <p className="gc-home-kicker">THÔNG TIN RÕ RÀNG</p>
                        <h2>Chọn bữa ăn đúng nhu cầu</h2>
                    </div>
                    <div className="gc-home-benefit-grid">
                        <div><ShieldCheck size={29} /><h3>Thông tin đầu bếp</h3><p>Xem phần giới thiệu và phong cách nấu trước khi chọn.</p></div>
                        <div><People size={29} /><h3>Đúng số người ăn</h3><p>Chọn khẩu phần theo số thành viên trong gia đình.</p></div>
                        <div><CalendarCheck size={29} /><h3>Chủ động thời gian</h3><p>Ghi rõ ngày và khung giờ phục vụ mong muốn.</p></div>
                        <div><Check2Circle size={29} /><h3>Rõ ràng ngân sách</h3><p>Kiểm tra mức chi dự kiến trước khi tạo yêu cầu.</p></div>
                    </div>
                </Container>
            </section>
    );
}
