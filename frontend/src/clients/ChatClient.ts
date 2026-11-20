import axiosClient from './AxiosClient';
import { ENDPOINTS } from '../config/ApiConfig';
import type { KeySetPaginationResponse } from '../types/BookingTypes';

export interface SendMessageRequest {
  conversationId: number;
  content: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM';
  replyToMessageId?: number;
}

export interface ChatMessageResponse {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  content: string;
  messageType: string;
  read: boolean;
  readAt?: number;
  sentAt: number;
  attachments?: any[];
}

export interface ChatConversationResponse {
  id: number;
  booking?: {
    id: number;
    bookingCode: string;
    totalAmount: number;
  };
  customer: {
    id: number;
    name: string;
    avatar?: string;
  };
  chef: {
    id: number;
    name: string;
    avatar?: string;
  };
  status: 'ACTIVE' | 'CLOSED';
  lastMessageAt: number;
  unreadCount: number;
}

export const sendMessage = async (
  request: SendMessageRequest
): Promise<ChatMessageResponse> => {
  const response = await axiosClient.post<{
    data: ChatMessageResponse;
    success: boolean;
  }>(ENDPOINTS.CHAT.MESSAGES.SEND.V1, request);
  return response.data.data;
};

export const getConversations = async (
  lastId = 0
): Promise<KeySetPaginationResponse<ChatConversationResponse>> => {
  const response = await axiosClient.get<{
    data: KeySetPaginationResponse<ChatConversationResponse>;
    success: boolean;
  }>(ENDPOINTS.CHAT.CONVERSATIONS.V1(lastId));
  return response.data.data;
};

export const getBookingConversation = async (
  bookingId: number | string
): Promise<ChatConversationResponse> => {
  const response = await axiosClient.get<{
    data: ChatConversationResponse;
    success: boolean;
  }>(ENDPOINTS.CHAT.CONVERSATIONS.BOOKING.V1(bookingId));
  return response.data.data;
};

export const getConversationMessages = async (
  conversationId: number
): Promise<ChatMessageResponse[]> => {
  const response = await axiosClient.get<{
    data: ChatMessageResponse[];
    success: boolean;
  }>(ENDPOINTS.CHAT.MESSAGES.V1(conversationId));
  return response.data.data;
};

export const getUnreadMessageCount = async (): Promise<number> => {
  const response = await axiosClient.get<{
    data: number;
    success: boolean;
  }>(ENDPOINTS.CHAT.CONVERSATIONS.UNREAD_COUNT.V1);
  return response.data.data ?? 0;
};

export const getUnreadMessages = async (): Promise<ChatMessageResponse[]> => {
  const response = await axiosClient.get<{
    data: ChatMessageResponse[];
    success: boolean;
  }>(ENDPOINTS.CHAT.CONVERSATIONS.UNREAD_MESSAGES.V1);
  return response.data.data ?? [];
};

export const markConversationAsRead = async (
  conversationId: number
): Promise<ChatConversationResponse> => {
  const response = await axiosClient.patch<{
    data: ChatConversationResponse;
    success: boolean;
  }>(ENDPOINTS.CHAT.CONVERSATIONS.READ.V1(conversationId));
  return response.data.data;
};

export const markAllConversationsAsRead = async (): Promise<void> => {
  await axiosClient.patch(ENDPOINTS.CHAT.CONVERSATIONS.READ_ALL.V1);
};

export const markMessageRead = async (
  messageId: number
): Promise<ChatMessageResponse> => {
  const response = await axiosClient.patch<{
    data: ChatMessageResponse;
    success: boolean;
  }>(ENDPOINTS.CHAT.MESSAGES.MARK_READ.V1(messageId));
  return response.data.data;
};

