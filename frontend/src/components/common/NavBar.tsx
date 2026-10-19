import { Navbar as BsNavbar, Container, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router';
import { useEffect, useRef } from 'react';
import { ArrowRight } from 'react-bootstrap-icons';
import { UserProvider, useUser } from '../../contexts/UserContext';
import { useProfile } from '../../contexts/ProfileContext';
import { useApp } from '../../contexts/AppContext';
import { authStore } from '../../stores/authStore';
import logo from '../../assets/go-cook-logo.svg';
import '../../styles/siteChrome.css';

function NavbarChildren() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const { profileData, fetchProfile, setProfileData } = useProfile();
  const { notify } = useApp();
  const fetchedProfile = useRef(false);

  useEffect(() => {
    // Check the existing cookie once. An anonymous visitor is still allowed to view Home.
    if (fetchedProfile.current) return;
    fetchedProfile.current = true;
    void fetchProfile();
    return authStore.subscribe(() => {
      if (authStore.isAuthorized()) void fetchProfile();
      if (authStore.isUnAuthorized()) setProfileData(null);
    });
  }, [fetchProfile, setProfileData]);

  async function handleLogout() {
    try {
      await logout();
      setProfileData(null);
      notify('Đã đăng xuất', { title: 'GoCook', variant: 'success' });
      navigate('/');
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Không thể đăng xuất', { title: 'GoCook', variant: 'danger' });
    }
  }

  const username = profileData?.username || 'Tài khoản';

  return (
    <BsNavbar expand="lg" className="gc-navbar" sticky="top" collapseOnSelect>
      <Container>
        <BsNavbar.Brand as={Link} to="/" className="gc-navbar-brand">
          <img src={logo} alt="GoCook - Trang chủ" />
        </BsNavbar.Brand>
        <BsNavbar.Toggle aria-controls="gc-main-navbar" />
        <BsNavbar.Collapse id="gc-main-navbar">
          <Nav className="gc-nav-links mx-auto">
            <Nav.Link as={Link} to="/">Trang chủ</Nav.Link>
            <Nav.Link as={Link} to="/menus">Thực đơn</Nav.Link>
            <Nav.Link as={Link} to="/create-menu">Tạo thực đơn</Nav.Link>
            <Nav.Link as={Link} to="/#dau-bep">Đầu bếp</Nav.Link>
            <Nav.Link as={Link} to="/#cach-hoat-dong">Cách hoạt động</Nav.Link>
          </Nav>
          <Nav className="gc-nav-actions">
            {profileData ? (
              <NavDropdown id="gc-account-dropdown" align="end" title={
                <span className="gc-profile-trigger">
                  {profileData.avatarUrl ? <img src={profileData.avatarUrl} alt="" /> :
                    <span className="gc-user-initial">{username.charAt(0).toUpperCase()}</span>}
                  <span>{username}</span>
                </span>
              }>
                <NavDropdown.Item as={Link} to="/profile">Tài khoản của tôi</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Đăng xuất</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login" className="gc-nav-login">Đăng nhập <ArrowRight size={15} /></Nav.Link>
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}

export default function Navbar() {
  return <UserProvider><NavbarChildren /></UserProvider>;
}
