import {
  Navbar as BsNavbar,
  Container,
  Nav,
  NavDropdown,
} from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { UserProvider, useUser } from "../../contexts/UserContext.tsx";
import logo from "../../assets/go-cook-logo.svg";
import { useProfile } from "../../contexts/ProfileContext.tsx";
import { useEffect } from "react";
import { useApp } from "../../contexts/AppContext.tsx";

import { authStore } from "../../stores/authStore";

function NavbarChildren() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const { profileData, fetchProfile, setProfileData } = useProfile();
  const { notify } = useApp();

  useEffect(() => {
    void fetchProfile();
    return authStore.subscribe(() => {
      if (authStore.isAuthorized()) void fetchProfile();
      if (authStore.isUnAuthorized()) setProfileData(null);
    });
  }, [fetchProfile, setProfileData]);

  const username = profileData?.username || "User";
  const firstLetter = username.charAt(0).toUpperCase();
  const hasAvatar = Boolean(profileData?.avatarUrl);

  const handleLogout = async () => {
    try {
      await logout();
      notify("Log out successfully", {
        title: "Log out",
        variant: "success",
      });
      setProfileData(null);
      navigate("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      notify(message, {
        title: "Log out",
        variant: "danger",
      });
    }
  };

  return (
    <BsNavbar expand="lg" bg="light" variant="light" className="border-bottom">
      <Container>
        <BsNavbar.Brand as={Link} to="/">
          <link
            rel="icon"
            type="image/svg+xml"
            href="../../assets/go-cook-icon.svg"
          />
        </BsNavbar.Brand>

        <BsNavbar.Toggle aria-controls="main-navbar" />
        <BsNavbar.Collapse id="main-navbar">
          <Nav className="me-auto fs-5">
            <Nav.Link as={Link} to="/">
              <img src={logo} alt="GO Cook" height={48} />
            </Nav.Link>
            <Nav.Link as={Link} to="/courses">
              Khám phá đầu bếp
            </Nav.Link>
            <Nav.Link as={Link} to="/forum">
              Thực đơn
            </Nav.Link>
            <Nav.Link as={Link} to="/forum">
              Tạo yêu cầu
            </Nav.Link>
            {(!profileData || !profileData.isChef) && (
              <Nav.Link as={Link} to="/become-chef">
                Trở thành đầu bếp
              </Nav.Link>
            )}
          </Nav>

          {profileData && (
            <Nav className="fs-5">
              <NavDropdown
                title={
                  hasAvatar ? (
                    <img
                      src={profileData.avatarUrl}
                      alt={username}
                      className="rounded-circle"
                      style={{
                        width: "38px",
                        height: "38px",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      className="d-inline-flex align-items-center justify-content-center rounded-circle bg-second-light text-secondary"
                      style={{
                        width: "38px",
                        height: "38px",
                        fontSize: "16px",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      {firstLetter}
                    </div>
                  )
                }
                id="user-dropdown"
                align="end"
              >
                <NavDropdown.Item as={Link} to="/profile">
                  <span>Tài khoản</span>
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/my-learning-space">
                  Bookings
                </NavDropdown.Item>
                <NavDropdown.Item as={Link} to="/wishlist">
                  Tạo yêu cầu
                </NavDropdown.Item>
                <NavDropdown.Divider />
                {profileData?.isChef && (
                  <NavDropdown.Item as={Link} to="/seller">
                    gian bếp
                  </NavDropdown.Item>
                )}

                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>
                  Log out
                </NavDropdown.Item>
              </NavDropdown>
            </Nav>
          )}
          {!profileData && (
            <Nav>
              <Nav.Link as={Link} to="/login">
                Đăng nhập
              </Nav.Link>
              <Nav.Link as={Link} to="/signup">
                Đăng ký
              </Nav.Link>
            </Nav>
          )}
        </BsNavbar.Collapse>
      </Container>
    </BsNavbar>
  );
}

export default function Navbar() {
  return (
    <UserProvider>
      <NavbarChildren />
    </UserProvider>
  );
}
