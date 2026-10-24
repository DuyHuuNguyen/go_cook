import { useEffect } from "react";
import {
  Container,
  Nav,
  Navbar as BsNavbar,
  NavDropdown,
} from "react-bootstrap";
import { BoxArrowUpRight, ShieldCheck } from "react-bootstrap-icons";
import { Link, NavLink, useNavigate } from "react-router";
import { UserProvider, useUser } from "../../contexts/UserContext.tsx";
import { useProfile } from "../../contexts/ProfileContext.tsx";
import { useApp } from "../../contexts/AppContext.tsx";
import { authStore } from "../../stores/authStore";
import logo from "../../assets/go-cook-logo.svg";
import "../../styles/siteChrome.css";

function NavbarContent() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const { profileData, loading, fetchProfile, setProfileData } = useProfile();
  const { notify } = useApp();

  useEffect(() => {
    void fetchProfile();

    return authStore.subscribe(() => {
      if (authStore.isAuthorized()) void fetchProfile();
      if (authStore.isUnAuthorized()) setProfileData(null);
    });
  }, [fetchProfile, setProfileData]);

  const isAdmin = profileData?.roles?.includes("ROLE_SYSTEM_ADMIN") ?? false;
  const username = profileData?.username || "Tài khoản";
  const initial = username.charAt(0).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      setProfileData(null);
      notify("Đã đăng xuất", { title: "Tài khoản", variant: "success" });
      navigate("/login");
    } catch (error) {
      notify(error instanceof Error ? error.message : "Không thể đăng xuất", {
        title: "Tài khoản",
        variant: "danger",
      });
    }
  };

  return (
    <BsNavbar expand="lg" sticky="top" className="gc-navbar">
      <Container className="gc-navbar-container">
        <BsNavbar.Brand as={Link} to="/" className="gc-navbar-brand">
          <img src={logo} alt="GoCook" />
        </BsNavbar.Brand>

        <BsNavbar.Toggle
          className="gc-navbar-toggle"
          aria-controls="gc-main-nav"
          aria-label="Mở menu điều hướng"
        />

        <BsNavbar.Collapse id="gc-main-nav" className="gc-navbar-collapse">
          <Nav className="gc-nav-links">
            <Nav.Link as={Link} to="/#dau-bep">
              Khám phá đầu bếp
            </Nav.Link>
            <Nav.Link as={NavLink} to="/menus">
              Thực đơn
            </Nav.Link>
            <Nav.Link as={NavLink} to="/create-menu">
              Tạo yêu cầu
            </Nav.Link>
            {(!profileData || !profileData.isChef) && (
              <Nav.Link as={NavLink} to="/become-chef">
                Trở thành đầu bếp
              </Nav.Link>
            )}
          </Nav>

          <Nav className="gc-navbar-account">
            {isAdmin && (
              <Nav.Link as={Link} to="/admin" className="gc-admin-link">
                <ShieldCheck size={17} />
                <span>Quản trị</span>
                <BoxArrowUpRight size={13} />
              </Nav.Link>
            )}

            {profileData ? (
              <NavDropdown
                align="end"
                id="gc-user-menu"
                className="gc-profile-menu"
                title={
                  <span className="gc-profile-trigger">
                    {profileData.avatarUrl ? (
                      <img src={profileData.avatarUrl} alt="" className="gc-profile-avatar" />
                    ) : (
                      <span className="gc-user-initial">{initial}</span>
                    )}
                    <span className="gc-profile-name">{username}</span>
                  </span>
                }
              >
                <NavDropdown.Item as={Link} to="/profile">
                  Tài khoản của tôi
                </NavDropdown.Item>
                {profileData.isChef && (
                  <NavDropdown.Item as={Link} to="/seller">
                    Gian bếp
                  </NavDropdown.Item>
                )}
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Đăng xuất
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              !loading && (
                <>
                  <Nav.Link as={Link} to="/login" className="gc-navbar-signin">
                    Đăng nhập
                  </Nav.Link>
                  <Nav.Link as={Link} to="/signup" className="gc-navbar-signup">
                    Đăng ký
                  </Nav.Link>
                </>
              )
            )}
          </Nav>
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}

export default function Navbar() {
  return (
    <UserProvider>
      <NavbarContent />
    </UserProvider>
  );
}
