import axiosClient from './AxiosClient';
import { ENDPOINTS } from '../config/ApiConfig';
import type { HomeData } from '../types/HomeTypes';

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function getHomeData(signal?: AbortSignal): Promise<HomeData> {
  const { data } = await axiosClient.get<ApiResponse<HomeData>>(ENDPOINTS.HOME.GET.V1, { signal });
  if (!data.success || !data.data) {
    throw new Error('Không thể tải dữ liệu trang chủ');
  }
  return data.data;
}
