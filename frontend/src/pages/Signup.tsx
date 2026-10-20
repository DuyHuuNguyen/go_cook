import { useState, type FormEvent } from "react";
import { Alert, Button, Card, Container, Form } from "react-bootstrap";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../hooks/UseAuth";

export default function Signup() {
  const { signup, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({
    username: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  function field(name: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [name]: value }));
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      await signup(
        values.username,
        values.email,
        values.password,
        values.confirmPassword,
        values.phone,
      )
    ) {
      navigate("/login", { replace: true, state: { registered: true } });
    }
  }
  return (
    <Container className="py-5">
      <Card className="mx-auto" style={{ maxWidth: 480 }}>
        <Card.Body>
          <h1 className="h3">Đăng ký GoCook</h1>
          <p>Tạo tài khoản khách hàng để sử dụng GoCook.</p>
          {error && (
            <Alert variant="danger" dismissible onClose={clearError}>
              {error}
            </Alert>
          )}
          <Form onSubmit={submit}>
            <Form.Group className="mb-3" controlId="signup-name">
              <Form.Label>Họ và tên</Form.Label>
              <Form.Control
                required
                autoComplete="name"
                maxLength={255}
                value={values.username}
                onChange={(e) => field("username", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="signup-phone">
              <Form.Label>Số điện thoại</Form.Label>
              <Form.Control
                required
                type="tel"
                autoComplete="tel"
                pattern="\+?[0-9]{9,15}"
                maxLength={15}
                value={values.phone}
                onChange={(e) => field("phone", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="signup-email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                required
                type="email"
                autoComplete="email"
                value={values.email}
                onChange={(e) => field("email", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3" controlId="signup-password">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                required
                type="password"
                autoComplete="new-password"
                minLength={8}
                maxLength={72}
                value={values.password}
                onChange={(e) => field("password", e.target.value)}
              />
              <Form.Text>
                Ít nhất 8 ký tự, có chữ hoa, số và ký tự đặc biệt.
              </Form.Text>
            </Form.Group>
            <Form.Group className="mb-3" controlId="signup-confirm">
              <Form.Label>Xác nhận mật khẩu</Form.Label>
              <Form.Control
                required
                type="password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(e) => field("confirmPassword", e.target.value)}
              />
            </Form.Group>
            <Button type="submit" disabled={loading} className="w-100">
              {loading ? "Đang đăng ký…" : "Đăng ký"}
            </Button>
          </Form>
          <p className="mt-3 mb-0">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
}
