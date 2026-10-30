import axiosClient from "./AxiosClient.tsx";
import {ENDPOINTS} from "../config/ApiConfig.tsx";
import {MenuInitialData, MenuUpdatePayload} from "../components/menu/UpdatebleMenuForm.tsx";


export interface CreateMenuRequest {
    name: string;
    tempPrice: number;
    minGuests: number;
    maxGuests: number;
    description: string;
    status: string;
    categoryId: number;
    dishIds: number[];
}

export async function createMenu(payload: CreateMenuRequest) {
    const response = await axiosClient.post(`${ENDPOINTS.USER.MENU.POST.V1}`, payload);
    return response.data;
}

const API_BASE = "http://localhost:8083/api/v1";

export async function updateMenu(payload: MenuUpdatePayload): Promise<boolean> {

    const {id, ...body} = payload;
    console.log(payload)

    const res = await fetch(`${API_BASE}/menus/edit/${id}`, {
        method: "PATCH",
        credentials: "include", // gửi kèm cookie
        headers: {
            accept: "*/*",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });


    let data: { success?: boolean; message?: string } | null = null;
    try {
        data = await res.json();
    } catch {
        console.debug("error edit menu")
    }

    if (!res.ok || data?.success === false) {
        throw new Error(data?.message ?? "Cập nhật thực đơn thất bại");
    }

    return true;
}



export function toMenuInitialData(raw: Record<string, any>): MenuInitialData {
    return {
        id: raw.id,
        name: raw.name ?? "",
        tempPrice: raw.tempPrice ?? raw.price ?? 0,
        minGuests: raw.minGuests ?? 1,
        maxGuests: raw.maxGuests ?? 10,
        description: raw.description ?? "",
        status: raw.status ?? "ACTIVE",
        categoryId: raw.categoryId ?? raw.category?.id ?? 0,
        dishIds: raw.dishIds ?? raw.dishes?.map((d: { id: number }) => d.id) ?? [],
    };
}

