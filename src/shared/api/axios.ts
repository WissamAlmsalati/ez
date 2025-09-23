import { useSessionStore } from "@/entities/session/model/sessionStore";
import axios, { AxiosError } from "axios";
import humps from "humps";
export const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

apiInstance.interceptors.request.use(
  (config) => {
    const token = useSessionStore.getState().user?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data) {
      config.data = humps.decamelizeKeys(config.data);
    }
    if (config.params) {
      config.params = humps.decamelizeKeys(config.params);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiInstance.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = humps.camelizeKeys(response.data);
    }
    return response;
  },
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// توحيد شكل الخطأ ________ يجب الاتفاق مع الباك
