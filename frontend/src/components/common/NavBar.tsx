import { useEffect } from "react";
import {
  Badge,
  Button,
  Container,
  Nav,
  Navbar as BsNavbar,
  NavDropdown,
} from "react-bootstrap";
import { Bell, BoxArrowUpRight, ChatDots, ShieldCheck } from "react-bootstrap-icons";
import { Link, NavLink, useNavigate } from "react-router";
import { UserProvider, useUser } from "../../contexts/UserContext.tsx";
import { useProfile } from "../../contexts/ProfileContext.tsx";
import { useApp } from "../../contexts/AppContext.tsx";
import { useChatNotification } from "../../contexts/ChatNotificationContext";
import { authStore } from "../../stores/authStore";
import logo from "../../assets/go-cook-logo.svg";
import "../../styles/siteChrome.css";

function NavbarContent() {
  const navigate = useNavigate();
  const { logout } = useUser();
  const { profileData, loading, fetchProfile, setProfileData } = useProfile();
  const { notify } = useApp();
  const {
    totalUnreadCount,
    unreadNotifications,
    markConversationRead,
    markNotificationRead,
    markAllNotificationsRead,
  } = useChatNotification();

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
            <Nav.Link as={Link} to="/explore-chefs">
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
            {profileData && (
              <>
                <NavDropdown
                  align="end"
                  id="gc-chat-notifications"
                  title={
                    <span className="gc-admin-link position-relative">
                      <Bell size={17} />
                      {totalUnreadCount > 0 && (
                        <Badge bg="danger" pill>
                          {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                        </Badge>
                      )}
                    </span>
                  }
                >
                  <div
                    className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
                    style={{ minWidth: "300px" }}
                  >
                    <strong className="small">Thông báo tin nhắn</strong>
                    {unreadNotifications.length > 0 && (
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-decoration-none small"
                        onClick={() => void markAllNotificationsRead()}
                      >
                        Đánh dấu tất cả đã đọc
                      </Button>
                    )}
                  </div>

                  {unreadNotifications.length === 0 ? (
                    <div className="px-3 py-3 text-muted small text-center">
                      Không có tin nhắn chưa đọc.
                    </div>
                  ) : (
                    <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                      {unreadNotifications.map((msg) => (
                        <div
                          key={msg.id}
                          className="px-3 py-2 border-bottom d-flex align-items-start justify-content-between gap-2"
                        >
                          <button
                            type="button"
                            className="btn btn-link p-0 text-start text-decoration-none flex-grow-1"
                            onClick={() => {
                              void markConversationRead(msg.conversationId);
                              navigate(`/chat?conversationId=${msg.conversationId}`);
                            }}
                          >
                            <div className="fw-semibold text-dark small">
                              {msg.senderName}
                            </div>
                            <div
                              className="text-muted small"
                              style={{
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {msg.content}
                            </div>
                          </button>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            style={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              void markNotificationRead(msg.id);
                            }}
                          >
                            Đã đọc
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </NavDropdown>

                <Nav.Link
                  as={Link}
                  to="/chat"
                  className="gc-admin-link position-relative"
                >
                  <ChatDots size={17} />
                  <span>Tin nhắn</span>
                  {totalUnreadCount > 0 && (
                    <Badge bg="danger" pill>
                      {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                    </Badge>
                  )}
                </Nav.Link>
              </>
            )}

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

                <NavDropdown.Item as={Link} to="/customer-booking">
                  Đơn
                </NavDropdown.Item>

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
