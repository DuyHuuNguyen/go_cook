import axiosClient from "./AxiosClient.tsx";
import { ENDPOINTS } from "../config/ApiConfig.tsx";

export async function login(email: string, password: string) {
  const response = await axiosClient.post(ENDPOINTS.USER.LOGIN.V2, {
    email,
    password,
  });
  return response.data;
}

export async function signup(
  username: string,
  email: string,
  password: string,
  phone: string,
) {
  const response = await axiosClient.post(`${ENDPOINTS.USER.SIGN_UP.V1}`, {
    username,
    phone,
    email,
    password,
  });

  return response.data;
}

export async function logout() {
  const response = await axiosClient.post(`${ENDPOINTS.USER.LOGOUT.V2}`, {});
  return response.data;
}

export async function becomeChef(bio : string,experienceYears: number,wardCode:string,provinceCode: string,phone : string ){
  const response = await axiosClient.post(`${ENDPOINTS.USER.CHEF.CREATE.V2}`,
      {
        phone: phone,
        experienceYears: experienceYears,
        wardCode: wardCode,
        bio: bio,
        provinceCode: provinceCode
      });
  return response.data;
}