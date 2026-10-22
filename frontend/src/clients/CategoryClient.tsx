import axiosClient from "./AxiosClient.tsx";
import {ENDPOINTS} from "../config/ApiConfig.tsx";


export async function getCategories(lastId: number) {
    const response = await axiosClient.get(
        `${ENDPOINTS.USER.CATEGORY.GET.V1}/${lastId}`
    );
    return response.data;
}