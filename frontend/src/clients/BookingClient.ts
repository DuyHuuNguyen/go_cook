import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import {
  BookingResponse,
  CreateBookingRequest,
  MatchingChef,
  BookingRequestResponse,
} from "../types/BookingTypes";

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

  getMatchingChefs: async (
    bookingId: number | string,
  ): Promise<MatchingChef[]> => {
    const response = await axiosClient.get<{
      isSuccess: boolean;
      data: MatchingChef[];
    }>(ENDPOINTS.BOOKINGS.MATCHING_CHEFS.V1(bookingId));

    return response.data.data;
  },

  sendChefRequest: async (
    bookingId: number | string,
    chefId: number,
  ): Promise<BookingRequestResponse> => {
    const response = await axiosClient.post<{
      data: BookingRequestResponse;
      success: boolean;
    }>(ENDPOINTS.BOOKINGS.REQUEST.V1(bookingId), { chefId });

    return response.data.data;
  },
};
