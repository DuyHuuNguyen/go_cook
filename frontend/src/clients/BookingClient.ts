import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import {
  BookingResponse,
  CreateBookingRequest,
  MatchingChef,
  BookingRequestResponse,
  PaginationResponse,
  KeySetPaginationResponse,
} from "../types/BookingTypes";

export const bookingApi = {
  getBookings: async (
    page = 1,
    size = 10,
  ): Promise<PaginationResponse<BookingResponse>> => {
    const response = await axiosClient.get<{
      data: PaginationResponse<BookingResponse>;
      success: boolean;
    }>(ENDPOINTS.BOOKINGS.LIST.V1, {
      params: { page, size },
    });

    return response.data.data;
  },

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

  getChefBookings: async (
    lastId = 0,
  ): Promise<KeySetPaginationResponse<BookingResponse>> => {
    const response = await axiosClient.get<{
      data: KeySetPaginationResponse<BookingResponse>;
      success: boolean;
    }>(ENDPOINTS.BOOKINGS.CHEF_BOOKINGS.V1(lastId));

    return response.data.data;
  },

  updateChefBookingStatus: async (
    bookingId: number,
    status: "CHEF_ACCEPT" | "CHEF_REJECT",
  ): Promise<void> => {
    await axiosClient.patch(
      ENDPOINTS.BOOKINGS.CHEF_BOOKING_STATUS.V1(bookingId),
      { status },
    );
  },

  acceptChefBooking: async (
    bookingId: number,
  ): Promise<{ success: boolean; message: string }> => {
    await bookingApi.updateChefBookingStatus(bookingId, "CHEF_ACCEPT");
    return {
      success: true,
      message: `Đã chấp nhận đơn đặt bếp #${bookingId} thành công.`,
    };
  },

  rejectChefBooking: async (
    bookingId: number,
    _reason?: string,
  ): Promise<{ success: boolean; message: string }> => {
    await bookingApi.updateChefBookingStatus(bookingId, "CHEF_REJECT");
    return {
      success: true,
      message: `Đã từ chối đơn đặt bếp #${bookingId}.`,
    };
  },
};

export const getBookings = bookingApi.getBookings;
export const getChefBookings = bookingApi.getChefBookings;
export const updateChefBookingStatus = bookingApi.updateChefBookingStatus;
export const acceptChefBooking = bookingApi.acceptChefBooking;
export const rejectChefBooking = bookingApi.rejectChefBooking;
