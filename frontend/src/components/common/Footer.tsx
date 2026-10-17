import { Container, Row, Col } from "react-bootstrap";

function Footer() {
    return (
        <footer className="bg-light border-top mt-auto py-3">
            <Container>
                <Row className="align-items-center fs-5">
                    <Col md={6} className="text-center text-md-start">
                        <small>© {new Date().getFullYear()} Gocook. All rights reserved.</small>
                    </Col>
                    <Col md={6} className="text-center text-md-end">
                        <small></small>
                    </Col>
                </Row>
            </Container>
        </footer>
    );
}

export default Footer;