// Payment types for VNPay integration

export type PaymentStatus = "SUCCESS" | "FAILED" | "PENDING" | "EXPIRED";

export interface CreatePaymentRequest {
  bookingId: number;
}

export interface CreatePaymentResponse {
  paymentUrl: string;
  paymentId?: number;
  transactionId?: string;
}

export interface PaymentResultResponse {
  paymentId?: number;
  bookingId: number;
  status: PaymentStatus;
  amount?: number;
  transactionId?: string;
  paidAt?: string;
  message?: string;
}

/** Response từ backend sau khi verify VNPay callback params */
export interface VnpayVerifyResponse {
  paymentId?: number | null;
  bookingId?: number | null;
  status: PaymentStatus;
  verified: boolean;
  vnpResponseCode?: string;
  amount?: number;
  transactionId?: string;
  paidAt?: string;
  message?: string;
}

// Raw nested response shape from GET /api/v1/bookings/{bookingId}
export interface BookingDetailApiResponse {
  bookingInformation: {
    bookingId: number;
    bookingStatus: string;
    scheduledDateTime: number; // Unix timestamp (seconds)
    serviceAddress: string;
    guestCount: number;
    customerNote: string;
    totalAmount: number;
  };
  chefInformation: {
    chefId: number | null;
    chefName: string | null;
    chefAvatar: string | null;
    bio?: string;
    experienceYears?: number;
  } | null;
  menuInformation: {
    dishes: {
      dishId: number;
      dishName: string;
      dishImageUrl: string | null;
      quantity: number;
    }[];
  };
  paymentInformation: {
    paymentId: number | null;
    paymentMethod: string;
    status: string | null;
    amount: number;
  } | null;
}

// Flattened shape used by CheckoutPage
export interface BookingDetailResponse {
  id: number;
  bookingCode?: string;
  chefId: number | null;
  chefName: string | null;
  chefAvatar: string | null;
  scheduledAt: string; // ISO string converted from Unix timestamp
  serviceAddress: string;
  customerNote: string;
  guestCount: number;
  totalAmount: number;
  bookingStatus: string;
  dishes: BookingDishItem[];
  menuName?: string;
}

export interface BookingDishItem {
  dishId: number;
  dishName: string;
  quantity: number;
  imageUrl?: string;
  category?: string;
}
