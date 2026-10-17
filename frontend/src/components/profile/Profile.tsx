import RestPassword, { Profile, useProfile } from "../../contexts/ProfileContext.tsx";
import { Alert, Badge, Button, Card, Col, Form, Image, Row, Spinner } from "react-bootstrap";
import { useEffect, useState } from "react";
import { useApp } from "../../contexts/AppContext.tsx";
import { Eye, EyeSlash } from "react-bootstrap-icons";

interface ProfileForm {
    username: string;
    bio: string;
    experienceYears: number;
}

interface PasswordForm {
    newPassword: string;
    confirmPassword: string;
}

export function DraftProfile() {
    const { profileData, error, putProfile, updatePassword, passwordError } = useProfile();
    const { notify } = useApp();

    const [formData, setFormData] = useState<ProfileForm>({
        username: "",
        bio: "",
        experienceYears: 0,
    });
    const [passwordForm, setPasswordForm] = useState<PasswordForm>({
        newPassword: "",
        confirmPassword: "",
    });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [saving, setSaving] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Đồng bộ form khi profile được load / cập nhật
    useEffect(() => {
        if (profileData) {
            setFormData({
                username: profileData.username ?? "",
                bio: profileData.chefProfile?.bio ?? "",
                experienceYears: profileData.chefProfile?.experienceYears ?? 0,
            });
        }
    }, [profileData]);

    const isChef = !!profileData?.isChef;

    const isDirty = (p: Profile) =>
        formData.username !== p.username ||
        (p.isChef &&
            (formData.bio !== (p.chefProfile?.bio ?? "") ||
                formData.experienceYears !== (p.chefProfile?.experienceYears ?? 0)));

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileData) return;

        if (!formData.username.trim()) {
            notify("Username cannot be empty.", { title: "Profile", variant: "danger" });
            return;
        }
        if (formData.experienceYears < 0) {
            notify("Experience years must be 0 or greater.", { title: "Profile", variant: "danger" });
            return;
        }
        if (!isDirty(profileData)) {
            notify("No changes to update.", { title: "Profile", variant: "danger" });
            return;
        }

        const payload = {
            username: formData.username.trim(),
            ...(isChef && {
                chefProfile: {
                    bio: formData.bio,
                    experienceYears: formData.experienceYears,
                },
            }),
        };

        try {
            setSaving(true);
            // await putProfile(payload);
            notify("Update profile successfully.", { title: "Profile", variant: "success" });
        } catch {
            notify("Update profile failed.", { title: "Profile", variant: "danger" });
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
            notify("Please fill in both password fields.", { title: "Password", variant: "danger" });
            return;
        }

        try {
            setChangingPassword(true);
            await updatePassword(
                new RestPassword(passwordForm.newPassword, passwordForm.confirmPassword)
            );
            setPasswordForm({ newPassword: "", confirmPassword: "" });
        } finally {
            setChangingPassword(false);
        }
    };

    if (!profileData && !error) {
        return (
            <Card className="border-0">
                <Card.Body className="py-5 text-center">
                    <Spinner animation="border" variant="primary" />
                    <div className="mt-3 text-muted">Loading profile...</div>
                </Card.Body>
            </Card>
        );
    }

    return (
        <Card className="border-0 shadow-sm">
            {/* Header */}
            <div className="bg-primary text-white px-4 py-4">
                <div className="d-flex align-items-center gap-2">
                    <i className="bi bi-person-circle fs-4"></i>
                    <div>
                        <h4 className="mb-0 fw-semibold">My Profile</h4>
                        <small>Manage your personal information</small>
                    </div>
                </div>
            </div>

            <Card.Body className="p-4 p-md-5">
                {error && (
                    <Alert variant="danger" className="d-flex align-items-center gap-2 border-0">
                        <i className="bi bi-exclamation-triangle-fill"></i>
                        <span>{error}</span>
                    </Alert>
                )}

                {/* Overview */}
                <Row className="align-items-center g-4">
                    <Col xs={12} md="auto" className="text-center">
                        <Image
                            src={profileData?.avatarUrl || "https://via.placeholder.com/250"}
                            roundedCircle
                            width={180}
                            height={180}
                            className="object-fit-cover border border-4 border-white shadow"
                        />
                    </Col>

                    <Col>
                        <div className="text-center text-md-start">
                            <h3 className="fw-bold mb-2">{profileData?.username}</h3>

                            <div className="text-muted mb-3">
                                <i className="bi bi-envelope me-2"></i>
                                {profileData?.email}
                            </div>

                            <div className="d-flex flex-wrap justify-content-center justify-content-md-start gap-2">
                                {isChef && (
                                    <Badge bg="warning-subtle" text="warning" className="px-3 py-2 fw-medium">
                                        <i className="bi bi-egg-fried me-1"></i>
                                        Chef
                                        {profileData?.chefProfile &&
                                            ` · ${profileData.chefProfile.experienceYears} yrs`}
                                    </Badge>
                                )}
                                {profileData?.roles?.map((role : string) => (
                                    <Badge
                                        key={role}
                                        bg="primary-subtle"
                                        text="primary"
                                        className="px-3 py-2 fw-medium"
                                    >
                                        <i className="bi bi-shield-check me-1"></i>
                                        {role}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    </Col>
                </Row>

                <hr className="my-5" />

                {/* Edit profile */}
                <Form onSubmit={handleSaveProfile}>
                    <div className="mb-4">
                        <h5 className="fw-bold mb-0">Profile Information</h5>
                        <small className="text-muted">Update your public information</small>
                    </div>

                    <Row className="g-4">
                        <Col xs={12} md={6}>
                            <Form.Group controlId="profile-username">
                                <Form.Label className="fw-semibold">Username</Form.Label>
                                <Form.Control
                                    type="text"
                                    size="lg"
                                    value={formData.username}
                                    placeholder="Enter your username"
                                    onChange={(e) =>
                                        setFormData((prev) => ({ ...prev, username: e.target.value }))
                                    }
                                />
                            </Form.Group>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Group controlId="profile-email">
                                <Form.Label className="fw-semibold">Email</Form.Label>
                                <Form.Control
                                    type="email"
                                    size="lg"
                                    value={profileData?.email ?? ""}
                                    disabled
                                    readOnly
                                />
                            </Form.Group>
                        </Col>

                        {isChef && (
                            <>
                                <Col xs={12} md={6}>
                                    <Form.Group controlId="profile-experience">
                                        <Form.Label className="fw-semibold">Years of experience</Form.Label>
                                        <Form.Control
                                            type="number"
                                            min={0}
                                            size="lg"
                                            value={formData.experienceYears}
                                            onChange={(e) =>
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    experienceYears: Number(e.target.value) || 0,
                                                }))
                                            }
                                        />
                                    </Form.Group>
                                </Col>

                                <Col xs={12}>
                                    <Form.Group controlId="profile-bio">
                                        <Form.Label className="fw-semibold">Bio</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={5}
                                            value={formData.bio}
                                            placeholder="Tell people about your cooking experience..."
                                            onChange={(e) =>
                                                setFormData((prev) => ({ ...prev, bio: e.target.value }))
                                            }
                                        />
                                        <Form.Text className="text-muted">
                                            Introduce yourself and your cooking style.
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </>
                        )}

                        <Col xs={12} className="text-end">
                            <Button type="submit" variant="primary" disabled={saving}>
                                {saving ? (
                                    <Spinner size="sm" animation="border" className="me-2" />
                                ) : (
                                    <i className="bi bi-save me-2"></i>
                                )}
                                Save changes
                            </Button>
                        </Col>
                    </Row>
                </Form>

                <hr className="my-5" />

                {/* Change password */}
                <Form onSubmit={handleResetPassword}>
                    <h6 className="fw-bold mb-3">
                        <i className="bi bi-key me-2 text-primary"></i>
                        Change password
                    </h6>

                    <Row className="g-3">
                        <Col xs={12} md={6}>
                            <Form.Label className="fw-semibold">New password</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwordForm.newPassword}
                                    placeholder="Enter new password"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                                    }
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowNewPassword((v) => !v)}
                                >
                                    {showNewPassword ? <Eye /> : <EyeSlash />}
                                </Button>
                            </div>
                        </Col>

                        <Col xs={12} md={6}>
                            <Form.Label className="fw-semibold">Confirm password</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Control
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={passwordForm.confirmPassword}
                                    placeholder="Confirm new password"
                                    autoComplete="new-password"
                                    onChange={(e) =>
                                        setPasswordForm((prev) => ({
                                            ...prev,
                                            confirmPassword: e.target.value,
                                        }))
                                    }
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setShowConfirmPassword((v) => !v)}
                                >
                                    {showConfirmPassword ? <Eye /> : <EyeSlash />}
                                </Button>
                            </div>
                        </Col>

                        {passwordError && (
                            <Col xs={12}>
                                <Alert
                                    variant="danger"
                                    className="d-flex align-items-center gap-2 border-0 mb-0"
                                >
                                    <i className="bi bi-exclamation-triangle-fill"></i>
                                    <span>{passwordError}</span>
                                </Alert>
                            </Col>
                        )}

                        <Col xs={12} className="text-end">
                            <Button type="submit" variant="outline-primary" disabled={changingPassword}>
                                {changingPassword ? (
                                    <Spinner size="sm" animation="border" className="me-2" />
                                ) : (
                                    <i className="bi bi-key me-2"></i>
                                )}
                                Change password
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card.Body>
        </Card>
    );
}