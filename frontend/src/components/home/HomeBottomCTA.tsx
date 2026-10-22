import { Container } from 'react-bootstrap';
import { Link } from 'react-router';
import { ArrowRight } from 'react-bootstrap-icons';

export default function HomeBottomCTA() {
    return (
            <section className="gc-home-bottom-cta" id="tham-gia">
                <Container>
                    <div>
                        <p>GOCOOK</p>
                        <h2>Hôm nay nhà mình ăn gì?</h2>
                        <span>Bắt đầu với một thực đơn có sẵn, hoặc tự chọn món theo ý bạn.</span>
                    </div>
                    <div className="gc-home-bottom-actions">
                        <Link to="/menus" className="gc-home-btn gc-home-btn-light">
                            Xem thực đơn <ArrowRight size={18} />
                        </Link>
                        <Link to="/create-menu" className="gc-home-btn gc-home-btn-dark-outline">
                            Tạo thực đơn
                        </Link>
                    </div>
                </Container>
            </section>
    );
}
