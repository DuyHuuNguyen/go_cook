import type { AdminRow } from "../../types/AdminTypes";

// Development-only fixtures. Not backend records; never submitted to API.
export const adminDemoRows: Record<"menus", AdminRow[]> = {
  menus: [
    {
      id: "DEMO-M01",
      name: "Mâm cơm mẫu sum vầy",
      chef: "Đầu bếp mẫu Hương",
      category: "Cơm nhà",
      price: "600.000 đ",
      status: "ACTIVE",
      visibility: "PUBLIC",
      chefApproval: "APPROVED (mẫu)",
      dishes: "Cá kho, canh rau, thịt luộc",
      guests: "4–6 người",
      description: "Thực đơn công khai từ đầu bếp đã được duyệt.",
    },
    {
      id: "DEMO-M02",
      name: "Thực đơn mẫu đầu bếp tự ẩn",
      chef: "Đầu bếp mẫu Hương",
      category: "Cơm nhà",
      price: "500.000 đ",
      visibility: "CHEF_HIDDEN",
      visibilitySource: "Đầu bếp",
      chefApproval: "APPROVED (mẫu)",
      description: "Chủ thực đơn tự ẩn, không phải hạn chế của Admin.",
    },
    {
      id: "DEMO-M03",
      name: "Thực đơn mẫu bị Admin ẩn",
      chef: "Đầu bếp mẫu Hương",
      category: "Tiệc",
      price: "900.000 đ",
      visibility: "ADMIN_HIDDEN",
      visibilitySource: "Admin",
      reason: "Lý do mẫu: nội dung vi phạm quy định",
      priorVisibility: "Đầu bếp tự ẩn",
      chefApproval: "APPROVED (mẫu)",
    },
  ],
};
