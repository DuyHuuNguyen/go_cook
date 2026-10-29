import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import { BookingResponse, CreateBookingRequest } from "../types/BookingTypes";

export const bookingApi = {
  createBooking: async (
    request: CreateBookingRequest,
  ): Promise<BookingResponse> => {
    const response = await axiosClient.post<{
      data: BookingResponse;
      success: boolean;
    }>(ENDPOINTS.BOOKINGS.CREATE.V1, request);

    return response.data.data;
  },
};
