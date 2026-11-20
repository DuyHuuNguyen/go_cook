import axiosClient from "./AxiosClient";
import {
  CreatePaymentRequest,
  CreatePaymentResponse,
  PaymentResultResponse,
  VnpayVerifyResponse,
  BookingDetailApiResponse,
  BookingDetailResponse,
} from "../types/PaymentTypes";

export const paymentApi = {
  /**
   * Fetch booking detail for the checkout page.
   * GET /api/v1/bookings/{bookingId}
   *
   * API trả về nested object (bookingInformation, chefInformation, ...),
   * hàm này flatten thành BookingDetailResponse để dùng trong UI.
   */
  getBookingDetail: async (bookingId: number | string): Promise<BookingDetailResponse> => {
    const response = await axiosClient.get<{
      data: BookingDetailApiResponse;
      success: boolean;
    }>(`/api/v1/bookings/${bookingId}`);

    const { bookingInformation, chefInformation, menuInformation } = response.data.data;

    // Convert Unix timestamp (seconds) → ISO string
    const scheduledAt = new Date(bookingInformation.scheduledDateTime * 1000).toISOString();

    return {
      id: bookingInformation.bookingId,
      bookingStatus: bookingInformation.bookingStatus,
      scheduledAt,
      serviceAddress: bookingInformation.serviceAddress,
      guestCount: bookingInformation.guestCount,
      customerNote: bookingInformation.customerNote,
      totalAmount: bookingInformation.totalAmount,
      chefId: chefInformation?.chefId ?? null,
      chefName: chefInformation?.chefName ?? null,
      chefAvatar: chefInformation?.chefAvatar ?? null,
      dishes: (menuInformation?.dishes ?? []).map((d) => ({
        dishId: d.dishId,
        dishName: d.dishName,
        quantity: d.quantity,
        imageUrl: d.dishImageUrl ?? undefined,
      })),
    };
  },

  /**
   * Initiate VNPay payment – backend calculates amount.
   * POST /api/v1/payments/vnpay
   */
  createVnpayPayment: async (
    request: CreatePaymentRequest
  ): Promise<CreatePaymentResponse> => {
    const response = await axiosClient.post<{
      data: CreatePaymentResponse;
      success: boolean;
    }>("/api/v1/payments/vnpay", request);
    return response.data.data;
  },

  /**
   * Query actual payment status from backend.
   * GET /api/v1/payments/result?bookingId={bookingId}
   */
  getPaymentResult: async (
    bookingId: number | string
  ): Promise<PaymentResultResponse> => {
    const response = await axiosClient.get<{
      data: PaymentResultResponse;
      success: boolean;
    }>(`/api/v1/payments/result`, {
      params: { bookingId },
    });
    return response.data.data;
  },

  /**
   * Forward VNPay callback query params đến backend để verify chữ ký & lưu kết quả.
   * GET /api/v1/payments/vnpay/return?<all vnp_* params>
   *
   * Dùng khi backend đã sửa return URL thành frontend URL và
   * frontend cần proxy toàn bộ query string về backend.
   */
  verifyVnpayReturn: async (
    vnpParams: Record<string, string>
  ): Promise<VnpayVerifyResponse> => {
    const response = await axiosClient.get<{
      data: VnpayVerifyResponse;
      success: boolean;
    }>("/api/v1/payments/vnpay/return", { params: vnpParams });
    return response.data.data;
  },
};
