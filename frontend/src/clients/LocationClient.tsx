import axiosClient from "./AxiosClient.tsx";
import { ENDPOINTS } from "../config/ApiConfig.tsx";

export interface Province {
    code: string;
    fullName: string;
}

export interface Ward {
    code: string;
    fullName: string;
}

export interface LocationResponse<T> {
    data: T[];
    success: boolean;
}

export default async function getAllProvinces(): Promise<LocationResponse<Province>> {
    const response = await axiosClient.get(ENDPOINTS.LOCATION.PROVINCE.V1);
    return response.data;
}

export async function getWardsByProvince(
    provinceCode: string,
): Promise<LocationResponse<Ward>> {
    const response = await axiosClient.get(
        `${ENDPOINTS.LOCATION.PROVINCE.V1}/${encodeURIComponent(provinceCode)}/wards`,
    );
    return response.data;
}


export async function findWards(wardName: string) {
    const response = await axiosClient.get(
        `${ENDPOINTS.LOCATION.WARD.V1}?wardName=${encodeURIComponent(wardName)}`
    );

    return response.data;
}