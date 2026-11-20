import axiosClient from "./AxiosClient";
import { ENDPOINTS } from "../config/ApiConfig";
import { ChefDashboardStatistics } from "../types/ChefDashboardTypes";
import { ChefWeeklyScheduleResponse } from "../types/ChefScheduleTypes";

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

export const getChefWeeklySchedule = async (
  startDate?: string,
): Promise<ChefWeeklyScheduleResponse> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;

  const response = await axiosClient.get<{
    data: ChefWeeklyScheduleResponse;
    success: boolean;
  }>(ENDPOINTS.CHEF_DASHBOARD.WEEKLY_SCHEDULE.V1, { params });

  return response.data.data;
};

export const seedMockSchedules = async (): Promise<string> => {
  const response = await axiosClient.post<{
    data: string;
    success: boolean;
  }>(ENDPOINTS.CHEF_DASHBOARD.MOCK_SCHEDULES.V1);

  return response.data.data;
};
