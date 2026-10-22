import axios from "axios";
import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import type { AdminCollection, AdminRow, AdminSection } from "../types/AdminTypes";

type JsonRecord = Record<string, unknown>;
type ApiEnvelope = { success?: boolean; isSuccess?: boolean; data?: unknown };

const adminReadEndpoint = (section: AdminSection): string => {
    const endpoints: Record<AdminSection, string> = {
        users: ENDPOINTS.ADMIN.USERS,
        chefs: ENDPOINTS.ADMIN.CHEFS,
        menus: ENDPOINTS.ADMIN.MENUS,
        dishes: ENDPOINTS.ADMIN.DISHES,
        categories: ENDPOINTS.ADMIN.CATEGORIES,
        bookings: ENDPOINTS.ADMIN.BOOKINGS,
        requests: ENDPOINTS.ADMIN.REQUESTS,
        payments: ENDPOINTS.ADMIN.PAYMENTS,
        feedback: ENDPOINTS.ADMIN.FEEDBACK,
    };
    return endpoints[section];
};

const adminWriteEndpoint = (section: AdminSection): string => {
    const endpoints: Record<AdminSection, string> = {
        users: ENDPOINTS.ADMIN.USERS,
        chefs: ENDPOINTS.ADMIN.CHEFS,
        menus: ENDPOINTS.ADMIN.MENUS,
        dishes: ENDPOINTS.ADMIN.DISHES,
        categories: ENDPOINTS.ADMIN.CATEGORIES,
        bookings: ENDPOINTS.ADMIN.BOOKINGS,
        requests: ENDPOINTS.ADMIN.REQUESTS,
        payments: ENDPOINTS.ADMIN.PAYMENTS,
        feedback: ENDPOINTS.ADMIN.FEEDBACK,
    };
    return endpoints[section];
};

function object(value: unknown): JsonRecord {
    return value != null && typeof value === "object" && !Array.isArray(value)
        ? value as JsonRecord : {};
}

export function readPayload(input: unknown): unknown {
    const wrapper = object(input) as ApiEnvelope;
    if (wrapper.success === false || wrapper.isSuccess === false) {
        throw new Error("Yêu cầu không thành công.");
    }
    return Object.prototype.hasOwnProperty.call(wrapper, "data") ? wrapper.data : input;
}

function text(value: unknown): string {
    if (value == null || value === "") return "";
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") return String(value);
    const obj = object(value);
    return text(obj.name ?? obj.roleName ?? obj.username ?? obj.title ?? obj.email ?? obj.id);
}

function first(record: JsonRecord, ...keys: string[]): string {
    for (const key of keys) {
        const value = text(record[key]);
        if (value) return value;
    }
    return "";
}

function money(value: unknown): string {
    if (value === null || value === undefined || value === "") return "";
    const numeric = Number(value);
    return Number.isFinite(numeric) ? `${numeric.toLocaleString("vi-VN")} đ` : text(value);
}

function rowFor(section: AdminSection, item: unknown): AdminRow {
    const record = object(item);
    const id = text(record.id ?? record.code ?? record.transactionId);
    const name = first(record, "name", "username", "fullName", "title", "email", "customerName") || id;
    const base: AdminRow = { id, name };
    if (section === "menus") return {
        ...base, description: text(record.description), category: first(record, "category"),
        chef: first(record, "seller", "chef", "chefName"),
        price: money(record.tempPrice ?? record.price), status: text(record.status),
    };
    if (section === "users") return {
        ...base, email: text(record.email), role: Array.isArray(record.roles)
            ? record.roles.map(text).join(", ") : first(record, "role"),
        status: text(record.status ?? (record.isActive === true ? "Hoạt động" : record.isActive === false ? "Đã khóa" : "")),
    };
    if (section === "chefs") return {
        ...base, area: first(record, "area", "province", "location"),
        experience: first(record, "experience", "experienceYears"), status: text(record.status),
    };
    if (section === "bookings") return {
        ...base, chef: first(record, "chef", "chefName"),
        date: first(record, "date", "serviceDate", "bookingDate"),
        total: money(record.totalAmount ?? record.total), status: text(record.status),
    };
    if (section === "requests") return {
        ...base, guests: first(record, "guests", "guestCount", "numberOfGuests"),
        budget: money(record.budget), date: first(record, "date", "serviceDate"), status: text(record.status),
    };
    if (section === "payments") return {
        ...base, booking: first(record, "bookingId", "booking"),
        amount: money(record.amount), date: first(record, "date", "createdAt"), status: text(record.status),
    };
    if (section === "feedback") return {
        ...base, subject: first(record, "subject", "message", "content"),
        date: first(record, "date", "createdAt"), status: text(record.status),
    };
    return base;
}

export async function getAdminCollection(
    section: AdminSection,
    page: number,
    keyword: string,
    cursor: number,
    signal?: AbortSignal,
): Promise<AdminCollection> {
    let response;
    let keyset = false;
    try {
        response = await axiosClient.get<unknown>(adminReadEndpoint(section), {
            signal,
            params: { page, size: 10, keyword: keyword.trim() || undefined },
        });
    } catch (reason) {
        if (!axios.isAxiosError(reason) || reason.response?.status !== 404 ||
            !["menus", "categories", "dishes"].includes(section)) throw reason;

        keyset = section !== "menus";
        const publicEndpoint = section === "menus" ? ENDPOINTS.MENU.LIST.V1
            : section === "categories" ? ENDPOINTS.USER.CATEGORY.GET.V1 : ENDPOINTS.USER.DISH.GET.V1;
        response = await axiosClient.get<unknown>(keyset ? `${publicEndpoint}/${cursor}` : publicEndpoint, {
            signal,
            params: keyset ? undefined : { page, size: 10, keyword: keyword.trim() || undefined },
        });
    }
    const payload = readPayload(response.data);
    const result = object(payload);
    const candidates = Array.isArray(payload) ? payload
        : result.data ?? result.content ?? result.items ?? result.rows ?? [];
    const rows = Array.isArray(candidates) ? candidates.map((item) => rowFor(section, item)) : [];
    return {
        rows,
        total: typeof result.totalElements === "number" ? result.totalElements
            : typeof result.total === "number" ? result.total : null,
        hasNext: result.hasNext === true || (typeof result.totalPages === "number" && page < result.totalPages),
        nextCursor: keyset && typeof result.lastId === "number" ? result.lastId : null,
    };
}

export async function saveAdminRecord(
    section: AdminSection,
    id: string | null,
    payload: JsonRecord,
): Promise<void> {
    const base = adminWriteEndpoint(section);
    const response = id
        ? await axiosClient.patch(`${base}/${encodeURIComponent(id)}`, payload)
        : await axiosClient.post(base, payload);
    readPayload(response.data);
}

export async function getAdminDashboard(signal?: AbortSignal): Promise<JsonRecord> {
    const response = await axiosClient.get(ENDPOINTS.ADMIN.DASHBOARD, { signal });
    return object(readPayload(response.data));
}

export async function getAdminReports(days: number, signal?: AbortSignal): Promise<JsonRecord> {
    const response = await axiosClient.get(ENDPOINTS.ADMIN.REPORTS, { params: { days }, signal });
    return object(readPayload(response.data));
}

export async function getAdminSettings(signal?: AbortSignal): Promise<JsonRecord> {
    const response = await axiosClient.get(ENDPOINTS.ADMIN.SETTINGS, { signal });
    return object(readPayload(response.data));
}

export async function updateAdminSettings(values: JsonRecord): Promise<void> {
    const response = await axiosClient.put(ENDPOINTS.ADMIN.SETTINGS, values);
    readPayload(response.data);
}

export async function getAdminRoles(signal?: AbortSignal): Promise<Array<{ id: string; name: string }>> {
    const response = await axiosClient.get(ENDPOINTS.ADMIN.ROLES, { signal });
    const payload = readPayload(response.data);
    const list = Array.isArray(payload) ? payload : object(payload).data;
    return Array.isArray(list)
        ? list.map((entry) => ({ id: text(object(entry).id), name: text(object(entry).roleName ?? object(entry).name) }))
        : [];
}


type AdminTableSort = "asc" | "desc";

export type AdminTablePage = {
    rows: AdminRow[];
    recordsTotal: number;
    recordsFiltered: number;
};

const categoryCache = new Map<string, Promise<AdminRow[]>>();

async function loadAllCategories(): Promise<AdminRow[]> {
    const cached = categoryCache.get("categories");
    if (cached) return cached;

    const request = (async () => {
        const rows: AdminRow[] = [];
        let cursor = 0;

        for (let attempt = 0; attempt < 250; attempt += 1) {
            const response = await axiosClient.get<unknown>(`${ENDPOINTS.USER.CATEGORY.GET.V1}/${cursor}`);
            const result = object(readPayload(response.data));
            const items = Array.isArray(result.data) ? result.data : [];
            if (!items.length) return rows;

            rows.push(...items.map((item) => rowFor("categories", item)));
            const nextCursor = Number(result.lastId);
            if (result.hasNext !== true) return rows;
            if (!Number.isSafeInteger(nextCursor) || nextCursor <= cursor) {
                throw new Error("Dữ liệu phân trang danh mục không hợp lệ.");
            }
            cursor = nextCursor;
        }
        throw new Error("Danh sách danh mục quá lớn. Cần API quản trị có phân trang.");
    })();

    categoryCache.set("categories", request);
    request.catch(() => categoryCache.delete("categories"));
    return request;
}

export function clearAdminTableCache(section: AdminSection): void {
    if (section === "categories") categoryCache.delete("categories");
}

function getMenuSort(field: string, direction: AdminTableSort): string {
    if (field === "name") return direction === "asc" ? "NAME_ASC" : "NAME_DESC";
    if (field === "price") return direction === "asc" ? "PRICE_ASC" : "PRICE_DESC";
    return "LATEST";
}

export async function getAdminTablePage(
    section: AdminSection,
    page: number,
    size: number,
    keyword: string,
    sortBy: string,
    sortDirection: AdminTableSort,
): Promise<AdminTablePage> {
    const search = keyword.trim();
    let response;

    try {
        response = await axiosClient.get<unknown>(adminReadEndpoint(section), {
            params: {
                page,
                size,
                keyword: search || undefined,
                sortBy: sortBy || undefined,
                sortDirection: sortBy ? sortDirection : undefined,
            },
        });
    } catch (reason) {
        if (!axios.isAxiosError(reason) || reason.response?.status !== 404) throw reason;

        if (section === "categories") {
            const all = await loadAllCategories();
            const term = search.toLocaleLowerCase("vi");
            const matching = term
                ? all.filter((row) => Object.values(row).some((value) =>
                    String(value || "").toLocaleLowerCase("vi").includes(term)))
                : all;
            const sorted = [...matching];
            if (sortBy) {
                sorted.sort((a, b) =>
                    String(a[sortBy] ?? "").localeCompare(String(b[sortBy] ?? ""), "vi", { numeric: true })
                    * (sortDirection === "asc" ? 1 : -1));
            }
            return {
                rows: sorted.slice((page - 1) * size, page * size),
                recordsTotal: all.length,
                recordsFiltered: matching.length,
            };
        }

        if (section !== "menus") throw reason;
        response = await axiosClient.get<unknown>(ENDPOINTS.MENU.LIST.V1, {
            params: {
                page,
                size,
                keyword: search || undefined,
                sort: getMenuSort(sortBy, sortDirection),
            },
        });
    }

    const result = object(readPayload(response.data));
    const items = result.data ?? result.content ?? result.items ?? result.rows;
    if (!Array.isArray(items)) {
        throw new Error("API chưa trả danh sách dữ liệu hợp lệ.");
    }

    const filtered = Number(result.recordsFiltered ?? result.totalElements ?? result.total);
    if (!Number.isSafeInteger(filtered) || filtered < 0) {
        throw new Error("API cần trả totalElements để phân trang chính xác.");
    }

    const total = Number(result.recordsTotal ?? filtered);
    return {
        rows: items.map((item) => rowFor(section, item)),
        recordsTotal: Number.isSafeInteger(total) && total >= filtered ? total : filtered,
        recordsFiltered: filtered,
    };
}
