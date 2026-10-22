import { Container } from 'react-bootstrap';
import { Link } from 'react-router';
import logo from '../../assets/go-cook-logo.svg';
import '../../styles/siteChrome.css';

export default function Footer() {
  return (
    <footer className="gc-site-footer">
      <Container>
        <div className="gc-footer-top">
          <div className="gc-footer-about"><Link to="/"><img src={logo} alt="GoCook" /></Link>
            <p>Kết nối gia đình với đầu bếp tại nhà. Chọn thực đơn có sẵn hoặc tự lên danh sách món theo sở thích.</p></div>
          <div className="gc-footer-links"><strong>Khám phá</strong>
            <Link to="/menus">Thực đơn có sẵn</Link><Link to="/create-menu">Tự tạo thực đơn</Link><Link to="/#dau-bep">Gợi ý bữa ăn</Link></div>
          <div className="gc-footer-links"><strong>GoCook</strong>
            <Link to="/#cach-hoat-dong">Cách hoạt động</Link><Link to="/#tham-gia">Cùng GoCook</Link><Link to="/login">Đăng nhập</Link></div>
        </div>
        <div className="gc-footer-bottom"><span>© {new Date().getFullYear()} GoCook. Nấu ăn tại nhà.</span><span>Bữa cơm gia đình, theo cách của bạn.</span></div>
      </Container>
    </footer>
  );
}
