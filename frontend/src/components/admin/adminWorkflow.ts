import type { AdminRow, AdminSection } from "../../types/AdminTypes";

export type WorkflowSection = "users" | "chefs" | "menus";
export type WorkflowAction = {
  id: string;
  label: string;
  description: string;
  reasonRequired: boolean;
};
export const isWorkflowSection = (
  section: AdminSection,
): section is WorkflowSection => ["users", "chefs", "menus"].includes(section);

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
  menus: {
    PUBLIC: "Công khai",
    CHEF_HIDDEN: "Đầu bếp tự ẩn",
    ADMIN_HIDDEN: "Admin ẩn vi phạm",
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
  // ACTIVE/INACTIVE alone cannot tell who hid a menu. Preserve unknown visibility.
  return ["PUBLIC", "CHEF_HIDDEN", "ADMIN_HIDDEN"].includes(
    row.visibility || "",
  )
    ? row.visibility!
    : "";
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
          description:
            "Chỉ sau khi được APPROVED, hệ thống backend mới cấp ROLE_CHEF. Giao diện này không tự cấp quyền.",
          reasonRequired: false,
        },
        {
          id: "reject",
          label: "Từ chối hồ sơ",
          description:
            "Bắt buộc ghi lý do. USER được sửa hồ sơ và gửi lại; lần gửi lại chuyển về PENDING để Admin xem xét.",
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
  if (section === "menus") {
    if (state === "PUBLIC" || state === "CHEF_HIDDEN")
      return [
        {
          id: "hide",
          label: "Ẩn thực đơn vi phạm",
          description:
            "Ghi nhận lý do vi phạm và nguồn ẩn là Admin. Không chỉnh sửa nội dung hoặc yêu cầu duyệt từng thực đơn.",
          reasonRequired: true,
        },
      ];
    if (state === "ADMIN_HIDDEN")
      return [
        {
          id: "restore",
          label: "Gỡ ẩn do Admin",
          description:
            "Chỉ Admin được gỡ hạn chế này. Nếu đầu bếp đã tự ẩn trước đó, giữ trạng thái tự ẩn; không tự công khai thay đầu bếp.",
          reasonRequired: false,
        },
      ];
  }
  return [];
}
export const workflowNotes: Record<WorkflowSection, string> = {
  users:
    "Admin chỉ khóa/mở khóa tài khoản với lý do. Không sửa thông tin cá nhân, mật khẩu, Role hoặc xóa cứng.",
  chefs:
    "USER gửi hồ sơ → PENDING → APPROVED hoặc REJECTED. Hồ sơ bị từ chối được USER sửa và gửi lại. Chỉ APPROVED mới cấp ROLE_CHEF. SUSPENDED chỉ ngừng nhận đơn mới, không khóa tài khoản USER hay thay đổi đơn đã phát sinh.",
  menus:
    "Đầu bếp đã được duyệt tự công khai thực đơn, không cần duyệt từng thực đơn. Phân biệt đầu bếp tự ẩn và Admin ẩn vi phạm; chỉ Admin gỡ ẩn do Admin. Nội dung thực đơn luôn chỉ đọc tại đây.",
};
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
  menus: [
    { key: "dishes", label: "Danh sách món" },
    { key: "guests", label: "Số khách" },
    { key: "chefApproval", label: "Tình trạng duyệt đầu bếp" },
    { key: "visibilitySource", label: "Người ẩn" },
    { key: "reason", label: "Lý do ẩn" },
    { key: "priorVisibility", label: "Trạng thái trước khi Admin ẩn" },
  ],
};
