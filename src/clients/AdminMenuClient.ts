import axios from "axios";
import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import type { AdminMenuFilters, AdminMenuPage, AdminMenuRow } from "../types/AdminMenuTypes";

type JsonObject = Record<string, unknown>;

type MenuSort = "LATEST" | "PRICE_ASC" | "PRICE_DESC" | "NAME_ASC" | "NAME_DESC";

function record(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonObject
    : {};
}

function payload(value: unknown): unknown {
  const root = record(value);
  if (root.isSuccess === false || root.success === false) {
    throw new Error("Không thể tải dữ liệu thực đơn.");
  }
  return Object.prototype.hasOwnProperty.call(root, "data") ? root.data : value;
}

function str(value: unknown): string {
  return value === null || value === undefined ? "" : String(value);
}

function formatPrice(value: unknown): string {
  if (value === null || value === undefined) return "";
  const price = Number(value);
  return Number.isFinite(price) ? `${price.toLocaleString("vi-VN")} đ` : str(value);
}

function toMenuRow(value: unknown, source: "admin" | "public"): AdminMenuRow {
  const menu = record(value);
  const category = record(menu.category);
  const seller = record(menu.seller);
  const dishNames = Array.isArray(menu.dishes)
    ? menu.dishes.map((dish) => str(record(dish).name || dish)).filter(Boolean)
    : [];
  const imageUrls = Array.isArray(menu.imageUrls)
    ? menu.imageUrls.filter((url): url is string => typeof url === "string" && /^https?:\/\//i.test(url))
    : [];
  const active = typeof menu.isActive === "boolean" ? String(menu.isActive) : "";

  return {
    id: str(menu.id),
    name: str(menu.name),
    description: str(menu.description),
    category: str(category.name || menu.categoryName),
    chef: str(seller.username || menu.sellerName),
    price: formatPrice(menu.tempPrice),
    status: str(menu.status),
    isActive: active,
    source,
    moderationSource: str(menu.moderationSource),
    guests: menu.minGuests != null && menu.maxGuests != null
      ? `${menu.minGuests}–${menu.maxGuests}`
      : "",
    dishes: dishNames.join(", "),
    imageUrls: JSON.stringify(imageUrls),
    reason: str(menu.moderationReason),
  };
}

function menuSort(column: string, direction: "asc" | "desc"): MenuSort {
  if (column === "name") return direction === "asc" ? "NAME_ASC" : "NAME_DESC";
  if (column === "price") return direction === "asc" ? "PRICE_ASC" : "PRICE_DESC";
  return "LATEST";
}

export async function getAdminMenusPage(args: {
  page: number;
  size: number;
  keyword: string;
  sortBy: string;
  sortDirection: "asc" | "desc";
  filters?: AdminMenuFilters;
}): Promise<AdminMenuPage> {
  const params = {
    page: args.page,
    size: args.size,
    keyword: args.keyword.trim() || undefined,
    sort: menuSort(args.sortBy, args.sortDirection),
    ...args.filters,
  };
  let response;
  let source: "admin" | "public" = "admin";

  try {
    response = await axiosClient.get<unknown>(ENDPOINTS.ADMIN.MENUS, { params });
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
    source = "public";
    response = await axiosClient.get<unknown>(ENDPOINTS.MENU.LIST.V1, { params });
  }

  const data = record(payload(response.data));
  if (!Array.isArray(data.data) || !Number.isSafeInteger(data.totalElements)) {
    throw new Error("API trả danh sách thực đơn không đúng cấu trúc.");
  }
  return {
    rows: data.data.map((item) => toMenuRow(item, source)),
    recordsTotal: Number(data.totalElements),
    recordsFiltered: Number(data.totalElements),
  };
}

export async function getAdminMenuCategories(signal?: AbortSignal): Promise<Array<{id: number; name: string}>> {
  const categories: Array<{id: number; name: string}> = [];
  let cursor = 0;

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const response = await axiosClient.get<unknown>(
      `${ENDPOINTS.USER.CATEGORY.GET.V1}/${cursor}`,
      { signal },
    );
    const result = record(payload(response.data));
    if (!Array.isArray(result.data)) throw new Error("API danh mục trả dữ liệu không hợp lệ.");
    for (const value of result.data) {
      const item = record(value);
      if (typeof item.id === "number" && typeof item.name === "string") {
        categories.push({ id: item.id, name: item.name });
      }
    }
    if (result.hasNext !== true) return categories;
    const next = Number(result.lastId);
    if (!Number.isSafeInteger(next) || next <= cursor) {
      throw new Error("Con trỏ danh mục không hợp lệ.");
    }
    cursor = next;
  }
  throw new Error("Không tải hết danh sách danh mục.");
}

export async function updateAdminMenuStatus(
  id: string,
  isActive: boolean,
  reason: string,
): Promise<void> {
  const response = await axiosClient.patch<unknown>(
    `${ENDPOINTS.ADMIN.MENUS}/${encodeURIComponent(id)}/status`,
    { isActive, reason: isActive ? null : reason.trim() },
  );
  payload(response.data);
}
