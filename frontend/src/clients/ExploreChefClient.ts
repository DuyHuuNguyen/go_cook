import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import type { KeySetPaginationResponse } from "../types/BookingTypes";
import type { ExploreChefDetail, ExploreChefItem } from "../types/ExploreChefTypes";

export const exploreChefApi = {
  getExploreChefs: async (
    lastId = 0,
  ): Promise<KeySetPaginationResponse<ExploreChefItem>> => {
    const response = await axiosClient.get<{
      data: KeySetPaginationResponse<ExploreChefItem>;
      success: boolean;
    }>(ENDPOINTS.EXPLORE_CHEFS.LIST.V1(lastId));

    return response.data.data;
  },

  getExploreChefDetail: async (
    chefId: number | string,
  ): Promise<ExploreChefDetail> => {
    const response = await axiosClient.get<{
      data: ExploreChefDetail;
      success: boolean;
    }>(ENDPOINTS.EXPLORE_CHEFS.DETAIL.V1(chefId));

    return response.data.data;
  },
};

export const getExploreChefs = exploreChefApi.getExploreChefs;
export const getExploreChefDetail = exploreChefApi.getExploreChefDetail;

