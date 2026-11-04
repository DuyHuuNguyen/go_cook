import axios from 'axios';
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
  const response = await axios.post(ENDPOINTS.CHAT.OFFERS.CREATE.V1, request);
  return response.data.data;
};

export const acceptPriceOffer = async (offerId: number): Promise<PriceOfferResponse> => {
  const response = await axios.patch(ENDPOINTS.CHAT.OFFERS.ACCEPT.V1(offerId));
  return response.data.data;
};

export const rejectPriceOffer = async (offerId: number): Promise<PriceOfferResponse> => {
  const response = await axios.patch(ENDPOINTS.CHAT.OFFERS.REJECT.V1(offerId));
  return response.data.data;
};

export const getPriceOffers = async (
  conversationId: number
): Promise<PriceOfferResponse[]> => {
  // ponytail: implement list offers endpoint in backend
  console.log('List offers not yet implemented:', conversationId);
  return Promise.resolve([]);
};

