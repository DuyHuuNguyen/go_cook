import axiosClient from "./AxiosClient.tsx";
import { ENDPOINTS } from "../config/ApiConfig.tsx";

interface CurriculumWishListResponse {
    success: boolean;
}

/**
 * Calls the wishlist endpoint already declared in ApiConfig.
 * The request body assumes the API accepts a curriculumId field.
 */
export async function createCurriculumWishList(
    curriculumId: number
): Promise<CurriculumWishListResponse> {
    const response = await axiosClient.post<CurriculumWishListResponse>(
        ENDPOINTS.CURRICULUM.CURRICULUM_WISH_LIST.POST.V1,
        { curriculumId: curriculumId }
    );

    return response.data;
}
