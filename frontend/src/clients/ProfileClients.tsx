import axiosClient from "./AxiosClient.tsx";
import type {AxiosError} from "axios";
import {ENDPOINTS} from "../config/ApiConfig.tsx";
import RestPassword, {type ProfileUpdate} from "../contexts/ProfileContext.tsx";



export async function getProfile() {
    try {
        const response = await axiosClient.get(ENDPOINTS.USER.PROFILE.GET.V1);
        return response.data;
    } catch (error) {
        const err = error as AxiosError;
        throw new Error(err.message);
    }
}

export async function updateProfile(profileUpdate:ProfileUpdate){
    try {
        const response = await axiosClient.put(`${ENDPOINTS.USER.PROFILE.UPDATE.V1}`,
            {
                username: profileUpdate.username,
                instructorName:  profileUpdate.instructorName,
                instructorAbout:  profileUpdate.instructorAbout,
            });
        return response.data;
    } catch (error) {
        const err = error as AxiosError;
        throw new Error(err.message);
    }
}

export async function resetPassword(resetPassword: RestPassword){
    try {
        const response = await axiosClient.post(`${ENDPOINTS.USER.RESET_PASSWORD.V1}`,
            {
               newPassword: resetPassword.newPassword,
                confirmPassword: resetPassword.confirmPassword,
            });
        return response.data;
    } catch (error) {
        const err = error as AxiosError;
        throw new Error(err.message);
    }
}