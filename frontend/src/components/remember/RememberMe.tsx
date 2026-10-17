import { useState } from "react";
import { Card, Badge, Stack } from "react-bootstrap";
import {
    RememberMeProvider,
    useRememberMe
} from "../../contexts/RememberMeContext.tsx";

function RememberMeChild() {
    const { role, email, username, avatarUrl } = useRememberMe();

    const [imageError, setImageError] = useState(false);

    const avatar =
        username?.charAt(0).toUpperCase() || "?";

    const showAvatar = avatarUrl && !imageError;

    return (
        <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-3">
                <Stack
                    direction="horizontal"
                    gap={3}
                    className="align-items-center"
                >
                    {/* Avatar */}
                    {showAvatar ? (
                        <img
                            src={avatarUrl}
                            alt={`${username}'s avatar`}
                            className="rounded-circle flex-shrink-0"
                            style={{
                                width: "52px",
                                height: "52px",
                                objectFit: "cover",
                            }}
                            onError={() => setImageError(true)}
                        />
                    ) : (
                        <div
                            className="
                                bg-primary
                                text-white
                                rounded-circle
                                d-flex
                                align-items-center
                                justify-content-center
                                fw-bold
                                flex-shrink-0
                            "
                            style={{
                                width: "52px",
                                height: "52px",
                                fontSize: "20px",
                            }}
                        >
                            {avatar}
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-grow-1 overflow-hidden">
                        <Stack
                            direction="horizontal"
                            gap={2}
                            className="align-items-center"
                        >
                            <Card.Title
                                className="mb-0 text-truncate"
                                style={{ fontSize: "16px" }}
                            >
                                Go cook không quên bạn
                                <br/>
                                 <Badge
                                    bg="primary"
                                    pill
                                    className=""
                                >
                                    {username || "hello"}
                                </Badge>
                            </Card.Title>


                        </Stack>

                        <div
                            className="text-muted text-truncate mt-1"
                            style={{ fontSize: "13px" }}
                        >
                            <i className="bi bi-envelope me-1"></i>
                            {email || "No email"}
                        </div>
                    </div>
                </Stack>
            </Card.Body>
        </Card>
    );
}

export function RememberMe() {
    return (
        <RememberMeProvider>
            <RememberMeChild />
        </RememberMeProvider>
    );
}