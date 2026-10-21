import axiosClient from "./AxiosClient.tsx";
import { ENDPOINTS } from "../config/ApiConfig.tsx";

export default async  function getAllProvinces(){
    const response = await axiosClient.get(ENDPOINTS.LOCATION.PROVINCE.V1);
    return response.data;
}


export async function findWards(wardName: string) {
    const response = await axiosClient.get(
        `${ENDPOINTS.LOCATION.WARD.V1}?wardName=${encodeURIComponent(wardName)}`
    );

    return response.data;
}