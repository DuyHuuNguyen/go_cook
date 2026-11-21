import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { useState, useEffect, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router";
import { useApp } from "../contexts/AppContext.tsx";
import { useAuth } from "../hooks/UseAuth.tsx";
import { RememberMe } from "../components/remember/RememberMe.tsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [gisLoaded, setGisLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, loading, error, clearError } = useAuth();
  const { notify } = useApp();

  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "your-google-client-id.apps.googleusercontent.com";

  useEffect(() => {
    const scriptId = "google-gsi-client";
    const initGsi = () => {
      if ((window as any).google?.accounts?.id) {
        setGisLoaded(true);
        (window as any).google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
        });

        const btnContainer = document.getElementById("google-signin-btn-container");
        if (btnContainer) {
          btnContainer.innerHTML = "";
          (window as any).google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            width: 350,
            text: "signin_with",
            shape: "rectangular",
          });
        }
      }
    };

    if (document.getElementById(scriptId)) {
      initGsi();
      return;
    }

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initGsi();
    };
    document.body.appendChild(script);
  }, [GOOGLE_CLIENT_ID]);

  async function handleGoogleCredentialResponse(response: { credential?: string }) {
    if (response?.credential) {
      const success = await loginWithGoogle(response.credential);
      if (success) {
        notify("Đăng nhập với Google thành công", {
          title: "Đăng nhập",
          variant: "success",
        });
        navigate("/");
      }
    }
  }

  const handleCustomGoogleClick = () => {
    if ((window as any).google?.accounts?.id) {
      (window as any).google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const btn = document.querySelector("#google-signin-btn-container div[role=button]") as HTMLElement;
          if (btn) {
            btn.click();
          } else {
            notify("Vui lòng cấu hình Google Client ID trong file .env để hoàn tất đăng nhập Google.", {
              title: "Google Login",
              variant: "warning",
            });
          }
        }
      });
    } else {
      notify("Đang kết nối dịch vụ Google Sign-In, vui lòng thử lại.", {
        title: "Google Login",
        variant: "info",
      });
    }
  };

  // move to context.
  async function handleSubmitLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      notify("Login successful", {
        title: "Login",
        variant: "success",
      });
      navigate("/");
    }
  }

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "80vh" }}
    >
      <RememberMe />

      <Card
        bg="second-light"
        className="shadow w-100"
        style={{ maxWidth: "400px" }}
      >
        <Card.Body>
          <Card.Title className="text-center mb-4">
            <h2>Login with Gocook </h2>
          </Card.Title>

          {location.state?.registered && (
            <Alert variant="success">
              Đăng ký thành công. Vui lòng đăng nhập.
            </Alert>
          )}
          {error && (
            <Alert variant="danger" dismissible onClose={clearError}>
              {error}
            </Alert>
          )}

          <Form onSubmit={handleSubmitLogin}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                disabled={loading}
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Password</Form.Label>
              <div className="password-input-wrapper">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="password-input"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  <i
                    className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}
                  ></i>
                </button>
              </div>
            </Form.Group>

            <Button
              variant="primary"
              type="submit"
              className="w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    className="me-2"
                  />{" "}
                  Logging in...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          </Form>

          {/* Divider */}
          <div className="d-flex align-items-center my-3">
            <hr className="flex-grow-1 my-0" />
            <span className="mx-2 text-muted small fw-semibold">HOẶC</span>
            <hr className="flex-grow-1 my-0" />
          </div>

           {/*Google Sign In Area */}
          <div
              id="google-signin-btn-container"
              className="w-100 d-flex justify-content-center mb-2 d-none"
              style={{ minHeight: "40px" }}
          ></div>

          <Button
            variant="outline-secondary"
            type="button"
            className="w-100 d-flex align-items-center justify-content-center gap-2 py-2"
            onClick={handleCustomGoogleClick}
            disabled={loading}
            style={{
              backgroundColor: "#ffffff",
              borderColor: "#dadce0",
              color: "#3c4043",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.27 21.43 7.35 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.57 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>

            <span className="fw-medium">Đăng nhập với Google bug</span>
          </Button>

          <Button
            variant="link"
            onClick={() => {
              navigate("/password");
            }}
            className="mt-2 px-0 text-muted text-decoration-none text-center"
          >
            Forgot password?
          </Button>
          <hr className="mt-0" />
          <div className="hstack justify-content-between">
            <span className="text-muted">Don't have an account?</span>
            <Button
              variant="link"
              className="p-0"
              onClick={() => {
                navigate("/signup");
              }}
            >
              Sign up
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default Login;
