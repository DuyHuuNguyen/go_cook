import type { AdminRow, AdminSection } from "../../types/AdminTypes";

export type WorkflowSection = "users" | "chefs";
export type WorkflowAction = {
  id: string;
  label: string;
  description: string;
  reasonRequired: boolean;
};
export const isWorkflowSection = (
  section: AdminSection,
): section is WorkflowSection => ["users", "chefs"].includes(section);

export const workflowFilters: Record<
  WorkflowSection,
  Record<string, string>
> = {
  users: { ACTIVE: "Hoạt động", LOCKED: "Đã khóa" },
  chefs: {
    PENDING: "Chờ duyệt",
    APPROVED: "Đã duyệt · đang hoạt động",
    REJECTED: "Bị từ chối",
    SUSPENDED: "Đã duyệt · tạm ngừng",
  },
};
// These are UI labels, never payloads or a replacement for backend status conventions.
export function workflowState(section: WorkflowSection, row: AdminRow): string {
  if (section === "users") {
    if (["ACTIVE", "Hoạt động"].includes(row.status || "")) return "ACTIVE";
    if (["LOCKED", "Đã khóa", "INACTIVE"].includes(row.status || ""))
      return "LOCKED";
    return "";
  }
  if (section === "chefs") {
    if (row.serviceStatus === "SUSPENDED" || row.status === "SUSPENDED")
      return "SUSPENDED";
    return ["PENDING", "APPROVED", "REJECTED"].includes(
      row.reviewStatus || row.status || "",
    )
      ? row.reviewStatus || row.status || ""
      : "";
  }
  return "";
}
export function workflowLabel(section: WorkflowSection, row: AdminRow): string {
  return (
    workflowFilters[section][workflowState(section, row)] ||
    "Chưa có dữ liệu trạng thái nghiệp vụ"
  );
}
export function workflowActions(
  section: WorkflowSection,
  row: AdminRow,
): WorkflowAction[] {
  const state = workflowState(section, row);
  if (section === "users") {
    if (state === "ACTIVE")
      return [
        {
          id: "lock",
          label: "Khóa tài khoản",
          description:
            "Khóa quyền sử dụng tài khoản. Không sửa mật khẩu, thông tin cá nhân, vai trò hoặc xóa tài khoản.",
          reasonRequired: true,
        },
      ];
    if (state === "LOCKED")
      return [
        {
          id: "unlock",
          label: "Mở khóa tài khoản",
          description:
            "Khôi phục hoạt động của tài khoản, giữ nguyên vai trò và dữ liệu.",
          reasonRequired: false,
        },
      ];
  }
  if (section === "chefs") {
    if (state === "PENDING")
      return [
        {
          id: "approve",
          label: "Duyệt hồ sơ",
          description: "Duyệt hồ sơ để đầu bếp có thể bắt đầu hoạt động.",
          reasonRequired: false,
        },
        {
          id: "reject",
          label: "Từ chối hồ sơ",
          description:
            "Cần ghi rõ lý do. Người dùng có thể chỉnh sửa và gửi lại hồ sơ.",
          reasonRequired: true,
        },
      ];
    if (state === "APPROVED")
      return [
        {
          id: "suspend",
          label: "Tạm ngừng đầu bếp",
          description:
            "Không nhận đơn mới; vẫn dùng tài khoản USER. Giữ nguyên đơn đã phát sinh để Admin xem xét thủ công.",
          reasonRequired: true,
        },
      ];
    if (state === "SUSPENDED")
      return [
        {
          id: "resume",
          label: "Khôi phục hoạt động đầu bếp",
          description:
            "Khôi phục nhận đơn mới; không thay đổi lịch sử đơn hoặc trạng thái tài khoản USER.",
          reasonRequired: false,
        },
      ];
  }
  return [];
}
export const workflowDetails: Record<
  WorkflowSection,
  Array<{ key: string; label: string }>
> = {
  users: [
    { key: "phone", label: "Số điện thoại" },
    { key: "reason", label: "Lý do khóa gần nhất" },
    { key: "lockedAt", label: "Thời gian khóa gần nhất" },
    { key: "lockedBy", label: "Admin khóa gần nhất" },
  ],
  chefs: [
    { key: "userId", label: "Mã tài khoản" },
    { key: "description", label: "Giới thiệu" },
    { key: "provinceCode", label: "Mã tỉnh/thành" },
    { key: "wardCode", label: "Mã phường/xã" },
    { key: "reason", label: "Lý do xử lý gần nhất" },
    { key: "statusChangedAt", label: "Thời gian xử lý gần nhất" },
    { key: "statusChangedBy", label: "Mã người thực hiện" },
  ],
};
