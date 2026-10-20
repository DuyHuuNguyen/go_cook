import axios from "axios";
import { useEffect, useReducer } from "react";
import {
  login as loginApi,
  signup as signupApi,
} from "../clients/UserClient.tsx";
import { validEmail, validPassword } from "../validations/ValidationUtils.tsx";
import { authStore } from "../stores/authStore.ts";

type AuthStatus = {
  loading: boolean;
  error: any;
};

type AuthAction =
  | { type: "START_LOADING" }
  | { type: "AUTH_SUCCESS" }
  | { type: "AUTH_ERROR"; payload: any }
  | { type: "CLEAR_ERROR" };

type AuthApiResponse = {
  success?: boolean;
  accessToken?: string | null;
  refreshToken?: string | null;
};

const initialStatus: AuthStatus = {
  loading: false,
  error: null,
};

function userReducer(state: AuthStatus, action: AuthAction): AuthStatus {
  switch (action.type) {
    case "START_LOADING":
      return { loading: true, error: null };
    case "AUTH_SUCCESS":
      return { loading: false, error: null };
    case "AUTH_ERROR":
      return { loading: false, error: action.payload };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    default:
      return state;
  }
}

export function useAuth() {
  const [status, dispatch] = useReducer(userReducer, initialStatus);

  useEffect(() => {
    if (!status.error) return;

    const timer = window.setTimeout(
      () => dispatch({ type: "CLEAR_ERROR" }),
      3000,
    );
    return () => window.clearTimeout(timer);
  }, [status.error]);

  const clearError = () => dispatch({ type: "CLEAR_ERROR" });

  const login = async (email: string, password: string): Promise<boolean> => {
    const validationEmail = validEmail(email.trim());
    if (!validationEmail.success) {
      dispatch({ type: "AUTH_ERROR", payload: validationEmail.message });
      return false;
    }

    dispatch({ type: "START_LOADING" });
    try {
      const data = (await loginApi(
        email.trim().toLowerCase(),
        password,
      )) as AuthApiResponse;
      if (!data.success) {
        console.error(data);
        authStore.setAuthStatus("unauthorized");
        dispatch({ type: "AUTH_ERROR", payload: "Invalid email or password" });
        return false;
      }

      authStore.setAuthStatus("authorized");
      dispatch({ type: "AUTH_SUCCESS" });

      return true;
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.data?.message
        : null;
      dispatch({
        type: "AUTH_ERROR",
        payload: message || "Log in failed. Please try again.",
      });
      return false;
    }
  };

  const signup = async (
    username: string,
    email: string,
    password: string,
    confirmPassword: string,
    phone: string,
  ): Promise<boolean> => {
    const validationEmail = validEmail(email.trim());
    if (!validationEmail.success) {
      dispatch({ type: "AUTH_ERROR", payload: validationEmail.message });
      return false;
    }

    const validationPassword = validPassword(password);

    if (!validationPassword.success) {
      dispatch({ type: "AUTH_ERROR", payload: validationPassword.message });
      return false;
    }

    let isConfirmPasswordDontMatch = confirmPassword !== password;

    if (isConfirmPasswordDontMatch) {
      dispatch({ type: "AUTH_ERROR", payload: "Passwords do not match" });
      return false;
    }

    dispatch({ type: "START_LOADING" });
    try {
      const data = (await signupApi(
        username.trim(),
        email.trim().toLowerCase(),
        password,
        phone.trim(),
      )) as AuthApiResponse;
      if (!data.success) {
        authStore.setAuthStatus("unauthorized");
        dispatch({
          type: "AUTH_ERROR",
          payload: "Invalid values. Please try again.",
        });
        return false;
      }

      dispatch({ type: "AUTH_SUCCESS" });
      return true;
    } catch (error) {
      const data = axios.isAxiosError(error)
        ? error.response?.data?.data
        : null;
      dispatch({
        type: "AUTH_ERROR",
        payload: data?.message || "Sign up failed. Please try again.",
      });
      return false;
    }
  };

  return {
    login,
    signup,
    clearError,
    loading: status.loading,
    error: status.error,
  };
}
