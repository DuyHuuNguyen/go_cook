export type AdminSection =
  | "users"
  | "chefs"
  | "menus"
  | "dishes"
  | "categories"
  | "bookings"
  | "requests"
  | "payments"
  | "feedback";

export type AdminRow = {
  id: string;
  name: string;
  description?: string;
  [key: string]: string | undefined;
};

export type ChefApplicationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type ChefApplication = {
  id: number;
  userId: number;
  username: string;
  email: string;
  phone: string;
  provinceCode: string | null;
  wardCode: string | null;
  bio: string | null;
  experienceYears: number;
  status: ChefApplicationStatus;
  reason: string | null;
  submittedAt: number | null;
  statusChangedAt: number | null;
  statusChangedBy: number | null;
};

export type AdminCollection = {
  rows: AdminRow[];
  total: number | null;
  hasNext: boolean;
  nextCursor: number | null;
};

export type AdminColumn = { key: string; label: string };

export type AdminSectionInfo = {
  key: AdminSection;
  title: string;
  eyebrow: string;
  columns: AdminColumn[];
};

export const adminSections: Record<AdminSection, AdminSectionInfo> = {
  users: {
    key: "users",
    title: "Quản lý tài khoản",
    eyebrow: "Người dùng",
    columns: [
      { key: "id", label: "Mã tài khoản" },
      { key: "name", label: "Người dùng" },
      { key: "email", label: "Email" },
      { key: "role", label: "Vai trò" },
      { key: "status", label: "Trạng thái" },
    ],
  },
  chefs: {
    key: "chefs",
    title: "Quản lý đầu bếp",
    eyebrow: "Đối tác",
    columns: [
      { key: "id", label: "Mã hồ sơ" },
      { key: "name", label: "Tên đầu bếp" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Số điện thoại" },
      { key: "area", label: "Khu vực (mã)" },
      { key: "experience", label: "Kinh nghiệm" },
      { key: "status", label: "Hồ sơ / hoạt động" },
      { key: "submittedAt", label: "Ngày gửi" },
    ],
  },
  menus: {
    key: "menus",
    title: "Quản lý thực đơn",
    eyebrow: "Ẩm thực",
    columns: [
      { key: "id", label: "Mã" },
      { key: "name", label: "Thực đơn" },
      { key: "category", label: "Danh mục" },
      { key: "chef", label: "Đầu bếp" },
      { key: "price", label: "Giá dự kiến" },
      { key: "status", label: "Trạng thái" },
    ],
  },
  dishes: {
    key: "dishes",
    title: "Quản lý món ăn",
    eyebrow: "Ẩm thực",
    columns: [
      { key: "id", label: "Mã món" },
      { key: "name", label: "Tên món ăn" },
    ],
  },
  categories: {
    key: "categories",
    title: "Quản lý danh mục",
    eyebrow: "Ẩm thực",
    columns: [
      { key: "id", label: "Mã" },
      { key: "name", label: "Tên danh mục" },
    ],
  },
  bookings: {
    key: "bookings",
    title: "Quản lý đơn đặt",
    eyebrow: "Đơn hàng",
    columns: [
      { key: "id", label: "Mã đơn" },
      { key: "name", label: "Khách đặt" },
      { key: "chef", label: "Đầu bếp" },
      { key: "date", label: "Ngày phục vụ" },
      { key: "total", label: "Giá trị" },
      { key: "status", label: "Trạng thái" },
    ],
  },
  requests: {
    key: "requests",
    title: "Yêu cầu tự tạo",
    eyebrow: "Đơn hàng",
    columns: [
      { key: "id", label: "Mã yêu cầu" },
      { key: "name", label: "Khách hàng" },
      { key: "guests", label: "Số khách" },
      { key: "budget", label: "Ngân sách" },
      { key: "date", label: "Ngày nấu" },
      { key: "status", label: "Trạng thái" },
    ],
  },
  payments: {
    key: "payments",
    title: "Quản lý thanh toán",
    eyebrow: "Tài chính",
    columns: [
      { key: "id", label: "Mã giao dịch" },
      { key: "name", label: "Người thanh toán" },
      { key: "booking", label: "Đơn đặt" },
      { key: "amount", label: "Số tiền" },
      { key: "date", label: "Thời gian" },
      { key: "status", label: "Trạng thái" },
    ],
  },
  feedback: {
    key: "feedback",
    title: "Phản ánh và hỗ trợ",
    eyebrow: "Chăm sóc khách hàng",
    columns: [
      { key: "id", label: "Mã phản ánh" },
      { key: "name", label: "Người gửi" },
      { key: "subject", label: "Nội dung" },
      { key: "date", label: "Ngày gửi" },
      { key: "status", label: "Trạng thái" },
    ],
  },
};

export const adminSectionKeys: AdminSection[] = [
  "users",
  "chefs",
  "menus",
  "dishes",
  "categories",
  "bookings",
  "requests",
  "payments",
  "feedback",
];
