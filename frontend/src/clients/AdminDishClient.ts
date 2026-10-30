import axios from "axios";
import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import type { AdminRow } from "../types/AdminTypes";
import type { AdminDish, AdminDishFilters, AdminDishPage } from "../types/AdminDishTypes";

const base = ENDPOINTS.ADMIN.DISHES;

type ApiResponse<T> = { isSuccess?: boolean; success?: boolean; data: T };
type Page<T> = { data: T[]; totalElements: number };

function validDish(value: AdminDish): AdminDish {
  if (!Number.isSafeInteger(value.id) || typeof value.name !== "string" ||
      typeof value.isActive !== "boolean") {
    throw new Error("API món ăn trả dữ liệu không hợp lệ.");
  }
  return value;
}

function payload<T>(response: ApiResponse<T>): T {
  if (!response || (response.isSuccess !== true && response.success !== true) || response.data == null) {
    throw new Error("Không thể đọc dữ liệu món ăn.");
  }
  return response.data;
}

function mapDish(value: AdminDish): AdminRow {
  const dish = validDish(value);
  const status = dish.isActive
    ? "ACTIVE"
    : dish.moderationSource === "ADMIN" ? "ADMIN_HIDDEN" : "INACTIVE";
  return {
    id: String(dish.id),
    name: dish.name,
    chef: dish.chefName || "Dùng chung",
    chefId: dish.chefId == null ? "" : String(dish.chefId),
    ownership: dish.chefId == null ? "SHARED" : "CHEF",
    status,
    isActive: String(dish.isActive),
    moderationSource: dish.moderationSource || "",
    reason: dish.moderationReason || "",
    createdAt: dish.createdAt == null ? "" : String(dish.createdAt),
    updatedAt: dish.updatedAt == null ? "" : String(dish.updatedAt),
  };
}

export async function getAdminDishesPage(input: {
  page: number;
  size: number;
  keyword: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  filters?: AdminDishFilters;
}): Promise<AdminDishPage> {
  const response = await axiosClient.get<ApiResponse<Page<AdminDish>>>(base, {
    params: {
      page: input.page,
      size: input.size,
      keyword: input.keyword.trim() || undefined,
      sortBy: input.sortBy || "id",
      sortDirection: input.sortDirection,
      ...input.filters,
    },
  });
  const page = payload(response.data);
  if (!Array.isArray(page.data) || !Number.isSafeInteger(page.totalElements)) {
    throw new Error("API món ăn chưa trả phân trang hợp lệ.");
  }
  return {
    rows: page.data.map(mapDish),
    recordsTotal: page.totalElements,
    recordsFiltered: page.totalElements,
  };
}

export async function getAdminDish(id: string): Promise<AdminRow> {
  const response = await axiosClient.get<ApiResponse<AdminDish>>(`${base}/${encodeURIComponent(id)}`);
  return mapDish(payload(response.data));
}

export async function updateAdminDish(id: string, name: string): Promise<AdminRow> {
  const response = await axiosClient.put<ApiResponse<AdminDish>>(
    `${base}/${encodeURIComponent(id)}`,
    { name: name.trim() },
  );
  return mapDish(payload(response.data));
}

export async function updateAdminDishStatus(
  id: string,
  isActive: boolean,
  reason: string,
): Promise<AdminRow> {
  const response = await axiosClient.patch<ApiResponse<AdminDish>>(
    `${base}/${encodeURIComponent(id)}/status`,
    { isActive, reason: isActive ? null : reason.trim() },
  );
  return mapDish(payload(response.data));
}

export function adminDishError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.status === 401) return "Phiên đăng nhập đã hết hạn.";
    if (error.response?.status === 403) return "Bạn không có quyền quản lý món ăn.";
    if (error.response?.status === 404 || error.response?.status === 405)
      return "Không tìm thấy món ăn hoặc API quản trị chưa được triển khai.";
    if (error.response?.status === 400 || error.response?.status === 409)
      return "Dữ liệu không hợp lệ hoặc món ăn đã đổi trạng thái. Hãy làm mới.";
    return "Không thể xử lý yêu cầu. Vui lòng kiểm tra Backend.";
  }
  return error instanceof Error ? error.message : "Đã xảy ra lỗi.";
}
