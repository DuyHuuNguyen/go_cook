import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";

export interface BookingDishRequest {
    dishId: number;
    quantity: number;
}

export interface CreateBookingRequest {
    scheduledAt: string;
    serviceAddress: string;
    customerNote: string;
    guestCount: number;
    dishes: BookingDishRequest[];
}

export interface CreateBookingResponse {
    id: number;
    scheduledAt: string;
    serviceAddress: string;
    customerNote: string;
    guestCount: number;
    status: string;
    dishes: {
        dishId: number;
        dishName: string;
        quantity: number;
    }[];
    createdAt: string;
}


export async function createBooking(
    request: CreateBookingRequest
): Promise<CreateBookingResponse> {
    const { data } = await axiosClient.post<CreateBookingResponse>(
        ENDPOINTS.MENU.LIST.V1,
        {
            params: { page, size },
            signal,
        },
    );
    return response.data;
}