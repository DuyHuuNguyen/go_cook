import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import { ChefDashboardStatistics } from "../types/ChefDashboardTypes";

export const getChefDashboardStatistics = async (
  month?: number,
  year?: number,
): Promise<ChefDashboardStatistics> => {
  const params: Record<string, number> = {};
  if (month !== undefined) params.month = month;
  if (year !== undefined) params.year = year;

  const response = await axiosClient.get<{
    data: ChefDashboardStatistics;
    success: boolean;
  }>(ENDPOINTS.CHEF_DASHBOARD.STATISTICS.V1, { params });

  return response.data.data;
};
