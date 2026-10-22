import axiosClient from "./AxiosClient.tsx";
import {ENDPOINTS} from "../config/ApiConfig.tsx";


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