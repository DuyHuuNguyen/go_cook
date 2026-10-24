import axios from "axios";
import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import type {
  AdminCollection,
  AdminRow,
  AdminSection,
  ChefApplication,
  ChefApplicationStatus,
} from "../types/AdminTypes";

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
    ? (value as JsonRecord)
    : {};
}

export function readPayload(input: unknown): unknown {
  const wrapper = object(input) as ApiEnvelope;
  if (wrapper.success === false || wrapper.isSuccess === false) {
    throw new Error("Yêu cầu không thành công.");
  }
  return Object.prototype.hasOwnProperty.call(wrapper, "data")
    ? wrapper.data
    : input;
}

function text(value: unknown): string {
  if (value == null || value === "") return "";
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  )
    return String(value);
  const obj = object(value);
  return text(
    obj.name ??
      obj.roleName ??
      obj.username ??
      obj.title ??
      obj.email ??
      obj.id,
  );
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
  return Number.isFinite(numeric)
    ? `${numeric.toLocaleString("vi-VN")} đ`
    : text(value);
}

const chefStatuses: ChefApplicationStatus[] = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "SUSPENDED",
];

function chefApplication(input: unknown): ChefApplication {
  const record = object(input);
  if (
    typeof record.id !== "number" ||
    !Number.isSafeInteger(record.id) ||
    typeof record.userId !== "number" ||
    !Number.isSafeInteger(record.userId) ||
    typeof record.username !== "string" ||
    typeof record.email !== "string" ||
    typeof record.phone !== "string" ||
    typeof record.experienceYears !== "number" ||
    !chefStatuses.includes(record.status as ChefApplicationStatus)
  ) {
    throw new Error("API trả hồ sơ đầu bếp không hợp lệ.");
  }
  return record as ChefApplication;
}

function chefDate(value: number | null): string {
  if (value == null) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function chefRow(input: unknown): AdminRow {
  const chef = chefApplication(input);
  return {
    id: String(chef.id),
    userId: String(chef.userId),
    name: chef.username,
    email: chef.email,
    phone: chef.phone || "",
    area: [chef.provinceCode, chef.wardCode].filter(Boolean).join(" / "),
    provinceCode: chef.provinceCode || "",
    wardCode: chef.wardCode || "",
    experience: `${chef.experienceYears} năm`,
    status: chef.status,
    description: chef.bio || "",
    submittedAt: chefDate(chef.submittedAt),
    reason: chef.reason || "",
    statusChangedAt: chefDate(chef.statusChangedAt),
    statusChangedBy:
      chef.statusChangedBy == null ? "" : String(chef.statusChangedBy),
  };
}

export async function getChefApplication(
  id: string,
  signal?: AbortSignal,
): Promise<AdminRow> {
  const response = await axiosClient.get<unknown>(
    `${ENDPOINTS.ADMIN.CHEFS}/${encodeURIComponent(id)}`,
    { signal },
  );
  return chefRow(readPayload(response.data));
}

export async function reviewChefApplication(
  id: string,
  status: ChefApplicationStatus,
  reason: string,
): Promise<void> {
  const response = await axiosClient.patch<unknown>(
    `${ENDPOINTS.ADMIN.CHEFS}/${encodeURIComponent(id)}/status`,
    { status, reason: reason.trim() || null },
  );
  chefApplication(readPayload(response.data));
}

export function adminApiErrorMessage(reason: unknown): string {
  if (!axios.isAxiosError(reason))
    return reason instanceof Error
      ? reason.message
      : "Không thể xử lý yêu cầu.";
  const status = reason.response?.status;
  const response = object(reason.response?.data);
  const detail = object(response.data);
  const message = text(detail.message ?? response.message);
  if (status === 401)
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Tài khoản không có quyền quản trị đầu bếp.";
  if (status === 404) return "Không tìm thấy hồ sơ hoặc API quản trị đầu bếp.";
  if (status === 409)
    return message || "Hồ sơ đã thay đổi. Vui lòng tải lại danh sách.";
  if (status === 400)
    return message || "Dữ liệu không hợp lệ hoặc trạng thái đã thay đổi.";
  if (!reason.response) return "Không kết nối được backend. Vui lòng thử lại.";
  return message || "Backend không thể xử lý yêu cầu. Vui lòng thử lại.";
}

function chefPage(input: unknown): AdminTablePage {
  const result = object(readPayload(input));
  if (
    !Array.isArray(result.data) ||
    typeof result.totalElements !== "number" ||
    !Number.isSafeInteger(result.totalElements) ||
    result.totalElements < 0
  )
    throw new Error("API trả dữ liệu phân trang đầu bếp không hợp lệ.");
  return {
    rows: result.data.map(chefRow),
    recordsTotal: result.totalElements,
    recordsFiltered: result.totalElements,
  };
}

function rowFor(section: AdminSection, item: unknown): AdminRow {
  const record = object(item);
  const id = text(record.id ?? record.code ?? record.transactionId);
  const name =
    first(
      record,
      "name",
      "username",
      "fullName",
      "title",
      "email",
      "customerName",
    ) || id;
  const base: AdminRow = { id, name };
  if (section === "menus")
    return {
      ...base,
      description: text(record.description),
      category: first(record, "category"),
      chef: first(record, "seller", "chef", "chefName"),
      price: money(record.tempPrice ?? record.price),
      status: text(record.status),
      visibility: text(record.visibility),
      visibilitySource: text(record.visibilitySource),
      priorVisibility: text(record.priorVisibility),
      reason: first(record, "hiddenReason", "reason"),
      chefApproval: text(record.chefApproval),
      dishes: Array.isArray(record.dishes)
        ? record.dishes.map(text).join(", ")
        : text(record.dishes),
      guests:
        record.minGuests != null && record.maxGuests != null
          ? String(record.minGuests) + "–" + String(record.maxGuests)
          : "",
    };
  if (section === "users")
    return {
      ...base,
      email: text(record.email),
      role: Array.isArray(record.roles)
        ? record.roles.map(text).join(", ")
        : first(record, "role"),
      status:
        record.isActive === true
          ? "ACTIVE"
          : record.isActive === false
            ? "LOCKED"
            : text(record.status),
      phone: text(record.phone),
      reason: first(record, "lockReason", "reason"),
      lockedAt:
        typeof record.lockedAt === "number" ? chefDate(record.lockedAt) : "",
      lockedBy: text(record.lockedBy),
    };
  if (section === "chefs")
    return {
      ...base,
      area: first(record, "area", "province", "location"),
      experience: first(record, "experience", "experienceYears"),
      status: text(record.status),
      reviewStatus: text(record.reviewStatus),
      serviceStatus: text(record.serviceStatus),
      email: text(record.email),
      phone: text(record.phone),
      description: first(record, "bio", "description"),
      specialty: text(record.specialty),
      submittedAt: text(record.submittedAt),
      documents: Array.isArray(record.documents)
        ? record.documents.map(text).join(", ")
        : text(record.documents),
      reason: first(record, "rejectionReason", "suspensionReason", "reason"),
      accountStatus: text(record.accountStatus),
    };
  if (section === "bookings")
    return {
      ...base,
      chef: first(record, "chef", "chefName"),
      date: first(record, "date", "serviceDate", "bookingDate"),
      total: money(record.totalAmount ?? record.total),
      status: text(record.status),
    };
  if (section === "requests")
    return {
      ...base,
      guests: first(record, "guests", "guestCount", "numberOfGuests"),
      budget: money(record.budget),
      date: first(record, "date", "serviceDate"),
      status: text(record.status),
    };
  if (section === "payments")
    return {
      ...base,
      booking: first(record, "bookingId", "booking"),
      amount: money(record.amount),
      date: first(record, "date", "createdAt"),
      status: text(record.status),
    };
  if (section === "feedback")
    return {
      ...base,
      subject: first(record, "subject", "message", "content"),
      date: first(record, "date", "createdAt"),
      status: text(record.status),
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
  if (section === "chefs") {
    if (keyword.trim())
      throw new Error("Backend chưa hỗ trợ tìm kiếm hồ sơ đầu bếp.");
    const response = await axiosClient.get<unknown>(ENDPOINTS.ADMIN.CHEFS, {
      signal,
      params: { page, size: 10 },
    });
    const result = chefPage(response.data);
    return {
      rows: result.rows,
      total: result.recordsTotal,
      hasNext: page * 10 < result.recordsTotal,
      nextCursor: null,
    };
  }
  let response;
  let keyset = false;
  try {
    response = await axiosClient.get<unknown>(adminReadEndpoint(section), {
      signal,
      params: { page, size: 10, keyword: keyword.trim() || undefined },
    });
  } catch (reason) {
    if (
      !axios.isAxiosError(reason) ||
      reason.response?.status !== 404 ||
      !["menus", "categories", "dishes"].includes(section)
    )
      throw reason;

    keyset = section !== "menus";
    const publicEndpoint =
      section === "menus"
        ? ENDPOINTS.MENU.LIST.V1
        : section === "categories"
          ? ENDPOINTS.USER.CATEGORY.GET.V1
          : ENDPOINTS.USER.DISH.GET.V1;
    response = await axiosClient.get<unknown>(
      keyset ? `${publicEndpoint}/${cursor}` : publicEndpoint,
      {
        signal,
        params: keyset
          ? undefined
          : { page, size: 10, keyword: keyword.trim() || undefined },
      },
    );
  }
  const payload = readPayload(response.data);
  const result = object(payload);
  const candidates = Array.isArray(payload)
    ? payload
    : (result.data ?? result.content ?? result.items ?? result.rows ?? []);
  const rows = Array.isArray(candidates)
    ? candidates.map((item) => rowFor(section, item))
    : [];
  return {
    rows,
    total:
      typeof result.totalElements === "number"
        ? result.totalElements
        : typeof result.total === "number"
          ? result.total
          : null,
    hasNext:
      result.hasNext === true ||
      (typeof result.totalPages === "number" && page < result.totalPages),
    nextCursor:
      keyset && typeof result.lastId === "number" ? result.lastId : null,
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

export async function getAdminDashboard(
  signal?: AbortSignal,
): Promise<JsonRecord> {
  const response = await axiosClient.get(ENDPOINTS.ADMIN.DASHBOARD, { signal });
  return object(readPayload(response.data));
}

export async function getAdminReports(
  days: number,
  signal?: AbortSignal,
): Promise<JsonRecord> {
  const response = await axiosClient.get(ENDPOINTS.ADMIN.REPORTS, {
    params: { days },
    signal,
  });
  return object(readPayload(response.data));
}

export async function getAdminSettings(
  signal?: AbortSignal,
): Promise<JsonRecord> {
  const response = await axiosClient.get(ENDPOINTS.ADMIN.SETTINGS, { signal });
  return object(readPayload(response.data));
}

export async function updateAdminSettings(values: JsonRecord): Promise<void> {
  const response = await axiosClient.put(ENDPOINTS.ADMIN.SETTINGS, values);
  readPayload(response.data);
}

export async function getAdminRoles(
  signal?: AbortSignal,
): Promise<Array<{ id: string; name: string }>> {
  const response = await axiosClient.get(ENDPOINTS.ADMIN.ROLES, { signal });
  const payload = readPayload(response.data);
  const list = Array.isArray(payload) ? payload : object(payload).data;
  return Array.isArray(list)
    ? list.map((entry) => ({
        id: text(object(entry).id),
        name: text(object(entry).roleName ?? object(entry).name),
      }))
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
      const response = await axiosClient.get<unknown>(
        `${ENDPOINTS.USER.CATEGORY.GET.V1}/${cursor}`,
      );
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
    throw new Error(
      "Danh sách danh mục quá lớn. Cần API quản trị có phân trang.",
    );
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
  if (field === "price")
    return direction === "asc" ? "PRICE_ASC" : "PRICE_DESC";
  return "LATEST";
}

export async function getAdminTablePage(
  section: AdminSection,
  page: number,
  size: number,
  keyword: string,
  sortBy: string,
  sortDirection: AdminTableSort,
  statusFilter = "",
): Promise<AdminTablePage> {
  const search = keyword.trim();
  if (section === "users") {
    if (sortBy) throw new Error("Backend chưa hỗ trợ sắp xếp tài khoản.");
    if (statusFilter && !["ACTIVE", "LOCKED"].includes(statusFilter))
      throw new Error("Trạng thái tài khoản không hợp lệ.");
    const response = await axiosClient.get<unknown>(ENDPOINTS.ADMIN.USERS, {
      params: {
        page,
        size,
        keyword: search || undefined,
        status: statusFilter || undefined,
      },
    });
    const result = object(readPayload(response.data));
    if (
      !Array.isArray(result.data) ||
      !Number.isSafeInteger(result.totalElements)
    )
      throw new Error("API trả danh sách tài khoản không hợp lệ.");
    return {
      rows: result.data.map((item) => rowFor("users", item)),
      recordsTotal: Number(result.totalElements),
      recordsFiltered: Number(result.totalElements),
    };
  }
  if (section === "chefs") {
    if (search || sortBy)
      throw new Error(
        "Backend chưa hỗ trợ tìm kiếm hoặc sắp xếp hồ sơ đầu bếp.",
      );
    if (
      statusFilter &&
      !chefStatuses.includes(statusFilter as ChefApplicationStatus)
    )
      throw new Error("Trạng thái lọc đầu bếp không hợp lệ.");
    const response = await axiosClient.get<unknown>(ENDPOINTS.ADMIN.CHEFS, {
      params: { page, size, status: statusFilter || undefined },
    });
    return chefPage(response.data);
  }
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
    if (!axios.isAxiosError(reason) || reason.response?.status !== 404)
      throw reason;

    if (section === "categories") {
      const all = await loadAllCategories();
      const term = search.toLocaleLowerCase("vi");
      const matching = term
        ? all.filter((row) =>
            Object.values(row).some((value) =>
              String(value || "")
                .toLocaleLowerCase("vi")
                .includes(term),
            ),
          )
        : all;
      const sorted = [...matching];
      if (sortBy) {
        sorted.sort(
          (a, b) =>
            String(a[sortBy] ?? "").localeCompare(
              String(b[sortBy] ?? ""),
              "vi",
              { numeric: true },
            ) * (sortDirection === "asc" ? 1 : -1),
        );
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

  const filtered = Number(
    result.recordsFiltered ?? result.totalElements ?? result.total,
  );
  if (!Number.isSafeInteger(filtered) || filtered < 0) {
    throw new Error("API cần trả totalElements để phân trang chính xác.");
  }

  const total = Number(result.recordsTotal ?? filtered);
  return {
    rows: items.map((item) => rowFor(section, item)),
    recordsTotal:
      Number.isSafeInteger(total) && total >= filtered ? total : filtered,
    recordsFiltered: filtered,
  };
}

export async function getAdminUser(
  id: string,
  signal?: AbortSignal,
): Promise<AdminRow> {
  const response = await axiosClient.get<unknown>(
    `${ENDPOINTS.ADMIN.USERS}/${id}`,
    { signal },
  );
  return rowFor("users", readPayload(response.data));
}

export async function reviewAdminUser(
  id: string,
  status: "ACTIVE" | "LOCKED",
  reason: string,
): Promise<void> {
  const response = await axiosClient.patch<unknown>(
    `${ENDPOINTS.ADMIN.USERS}/${id}/status`,
    {
      status,
      reason: status === "LOCKED" ? reason.trim() : null,
    },
  );
  readPayload(response.data);
}
