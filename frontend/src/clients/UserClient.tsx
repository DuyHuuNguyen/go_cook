import axiosClient from "./AxiosClient.tsx";
import {ENDPOINTS} from "../config/ApiConfig.tsx";



export async function login(email: string, password: string) {
    try {
        console.log(`${ENDPOINTS.USER.LOGIN.V2}`)
        const response = await axiosClient.post(`${ENDPOINTS.USER.LOGIN.V2}`, {
            email,
            password,
        });

        return response.data;

    } catch (error) {
        console.error("Login request failed:", error);
        throw error;
    }
}

export async function signup(username: string, email: string, password: string) {
    const response = await axiosClient.post(`${ENDPOINTS.USER.SIGN_UP.V1}`, {
        username,
        email,
        password,
    });

    return response.data;
}


export async function logout() {
    const response = await axiosClient.post(
        `${ENDPOINTS.USER.LOGOUT.V1}`,
        {}
    );
    return response.data;
}