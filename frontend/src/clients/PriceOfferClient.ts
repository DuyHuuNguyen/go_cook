import axiosClient from './AxiosClient';
import { ENDPOINTS } from '../config/ApiConfig';

export interface CreatePriceOfferRequest {
  bookingId: number;
  chatConversationId: number;
  totalAmount: number;
  message?: string;
}

export interface PriceOfferResponse {
  id: number;
  bookingId: number;
  senderId: number;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  message?: string;
  createdAt: number;
}

export const createPriceOffer = async (
  request: CreatePriceOfferRequest
): Promise<PriceOfferResponse> => {
  const response = await axiosClient.post<{
    data: PriceOfferResponse;
    success: boolean;
  }>(ENDPOINTS.CHAT.OFFERS.CREATE.V1, request);
  return response.data.data;
};

export const acceptPriceOffer = async (offerId: number): Promise<PriceOfferResponse> => {
  const response = await axiosClient.patch<{
    data: PriceOfferResponse;
    success: boolean;
  }>(ENDPOINTS.CHAT.OFFERS.ACCEPT.V1(offerId));
  return response.data.data;
};

export const rejectPriceOffer = async (offerId: number): Promise<PriceOfferResponse> => {
  const response = await axiosClient.patch<{
    data: PriceOfferResponse;
    success: boolean;
  }>(ENDPOINTS.CHAT.OFFERS.REJECT.V1(offerId));
  return response.data.data;
};

export const getPriceOffers = async (
  conversationId: number
): Promise<PriceOfferResponse[]> => {
  const response = await axiosClient.get<{
    data: PriceOfferResponse[];
    success: boolean;
  }>(ENDPOINTS.CHAT.OFFERS.LIST.V1(conversationId));
  return response.data.data ?? [];
};

