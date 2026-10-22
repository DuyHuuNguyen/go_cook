import axiosClient from "./AxiosClient.tsx";
import {ENDPOINTS} from "../config/ApiConfig.tsx";

export async function getDishes(lastId:number ){
    const response = await axiosClient.get(`${ENDPOINTS.USER.DISH.GET.V1}/${lastId}`);
    return response.data;
}