import { Alert, Button, Card, Container, Form, Spinner } from "react-bootstrap";
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import {useApp} from "../contexts/AppContext.tsx";
import { useAuth } from "../hooks/UseAuth.tsx";
import {RememberMe} from "../components/remember/RememberMe.tsx";


function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();
    const { login, loading, error, clearError } = useAuth();
    const { notify } = useApp();


    // move to context.
    async function handleSubmitLogin(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const success = await login(email, password);
        if (success) {
            notify("Login successful", {
                title: 'Login',
                variant: 'success'
            });
            navigate("/");
        }
    }

    return (
        <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "80vh" }}>

            <RememberMe/>

            <Card bg="second-light" className="shadow w-100" style={{ maxWidth: "400px" }}>
                <Card.Body>
                    <Card.Title className="text-center mb-4">
                        <h2>Login with Gocook </h2>
                    </Card.Title>

                    {error && <Alert variant="danger" dismissible onClose={clearError}>{error}</Alert>}

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
                                    // disabled={loading}
                                    aria-label="Toggle password visibility"
                                >
                                    <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                                </button>
                            </div>
                        </Form.Group>

                        <Button
                            variant="primary"
                            type="submit"
                            className="w-100"
                            disabled={loading}
                        >
                            {loading ? <><Spinner as="span" animation="border" size="sm" className="me-2" /> Logging in...</> : "Submit"}
                        </Button>
                    </Form>
                    <Button
                        variant="link"
                        onClick={() => {
                            // clearError();
                            navigate("/password");
                        }}
                        className="mt-2 px-0 text-muted text-decoration-none text-center"
                        // disabled={loading}
                    >
                        Forgot password?
                    </Button>
                    <hr className="mt-0"/>
                    <div className="hstack justify-content-between">
                        <span className="text-muted">Don't have an account?</span>
                        <Button
                            variant="link"
                            className="p-0"
                            onClick={() => {
                                // clearError();
                                navigate("/signup");
                            }}
                            // disabled={loading}
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
