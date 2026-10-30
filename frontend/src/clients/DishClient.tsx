import axiosClient from "./AxiosClient.tsx";
import {ENDPOINTS} from "../config/ApiConfig.tsx";
import { DishSearchParams, DishSearchResponse, PaginationResponse } from "../types/BookingTypes.ts";

export async function getDishes(lastId:number ){
    const response = await axiosClient.get(`${ENDPOINTS.USER.DISH.GET.V1}/${lastId}`);
    return response.data;
}

export const searchDishes = async (
  params: DishSearchParams,
): Promise<PaginationResponse<DishSearchResponse>> => {
  const response = await axiosClient.get<{
    data: PaginationResponse<DishSearchResponse>;
    success: boolean;
  }>(ENDPOINTS.USER.DISH.SEARCH.V1, {
    params: {
      keyword: params.keyword,
      page: params.page,
      size: params.size,
    },
  });

  return response.data.data;
};