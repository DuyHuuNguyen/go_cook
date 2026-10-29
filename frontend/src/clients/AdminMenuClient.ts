import axios from "axios";
import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import type { AdminMenuFilters, AdminMenuPage, AdminMenuRow, AdminMenuUpdate } from "../types/AdminMenuTypes";

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
    status: source === "admin" && menu.isActive === false
      ? (menu.moderationSource === "ADMIN" ? "ADMIN_HIDDEN" : "HIDDEN")
      : str(menu.status),
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

async function fetchMenuPage(
  page: number,
  size: number,
  params: Record<string, string | number | undefined>,
): Promise<{ items: unknown[]; total: number; source: "admin" | "public" }> {
  let response;
  let source: "admin" | "public" = "admin";
  try {
    response = await axiosClient.get<unknown>(ENDPOINTS.ADMIN.MENUS, {
      params: { ...params, page, size },
    });
  } catch (error) {
    if (!axios.isAxiosError(error) || error.response?.status !== 404) throw error;
    source = "public";
    response = await axiosClient.get<unknown>(ENDPOINTS.MENU.LIST.V1, {
      params: { ...params, page, size },
    });
  }
  const data = record(payload(response.data));
  const total = Number(data.totalElements);
  if (!Array.isArray(data.data) || !Number.isSafeInteger(total) || total < 0) {
    throw new Error("API trả danh sách thực đơn không đúng cấu trúc.");
  }
  return { items: data.data, total, source };
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
    keyword: args.keyword.trim() || undefined,
    sort: menuSort(args.sortBy, args.sortDirection),
    ...args.filters,
  };

  if (args.sortBy === "id") {
    const batchSize = 100;
    const first = await fetchMenuPage(1, batchSize, params);
    const items = [...first.items];
    const totalPages = Math.ceil(first.total / batchSize);
    for (let page = 2; page <= totalPages; page += 1) {
      const next = await fetchMenuPage(page, batchSize, params);
      items.push(...next.items);
    }
    items.sort((a, b) => {
      const left = str(record(a).id);
      const right = str(record(b).id);
      return left.localeCompare(right, undefined, { numeric: true }) *
        (args.sortDirection === "asc" ? 1 : -1);
    });
    const start = (args.page - 1) * args.size;
    return {
      rows: items.slice(start, start + args.size).map((item) => toMenuRow(item, first.source)),
      recordsTotal: first.total,
      recordsFiltered: first.total,
    };
  }

  const result = await fetchMenuPage(args.page, args.size, params);
  return {
    rows: result.items.map((item) => toMenuRow(item, result.source)),
    recordsTotal: result.total,
    recordsFiltered: result.total,
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

export async function getAdminMenuDetail(id: string): Promise<AdminMenuUpdate> {
  const response = await axiosClient.get<unknown>(
    `${ENDPOINTS.ADMIN.MENUS}/${encodeURIComponent(id)}`,
  );
  const menu = record(payload(response.data));
  const category = record(menu.category);
  if (!menu.id || !menu.name || category.id == null || menu.tempPrice == null
    || menu.minGuests == null || menu.maxGuests == null) {
    throw new Error("API chi tiết thực đơn trả thiếu dữ liệu.");
  }
  return {
    name: str(menu.name),
    description: str(menu.description),
    categoryId: str(category.id),
    tempPrice: str(menu.tempPrice),
    minGuests: str(menu.minGuests),
    maxGuests: str(menu.maxGuests),
  };
}

export async function updateAdminMenu(id: string, values: AdminMenuUpdate): Promise<void> {
  const name = values.name.trim();
  const price = Number(values.tempPrice);
  const minGuests = Number(values.minGuests);
  const maxGuests = Number(values.maxGuests);
  const categoryId = Number(values.categoryId);
  if (!name || !Number.isFinite(price) || price < 0 ||
      !Number.isSafeInteger(categoryId) || categoryId < 1 ||
      !Number.isSafeInteger(minGuests) || minGuests < 1 ||
      !Number.isSafeInteger(maxGuests) || maxGuests < minGuests) {
    throw new Error("Kiểm tra lại tên, danh mục, giá và số khách.");
  }
  const response = await axiosClient.put<unknown>(
    `${ENDPOINTS.ADMIN.MENUS}/${encodeURIComponent(id)}`,
    {
      name,
      description: values.description.trim(),
      categoryId,
      tempPrice: price,
      minGuests,
      maxGuests,
    },
  );
  payload(response.data);
}
