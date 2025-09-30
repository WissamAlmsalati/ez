import { useSessionStore } from "@/entities/session/model/sessionStore";
import axios, { AxiosError } from "axios";
import humps from "humps";
export const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    // نترك تحديد نوع المحتوى للمتصفح خاصةً مع FormData
    // سيوضع application/json تلقائياً للطلبات العادية (axios) ما لم نضف FormData
  },
  timeout: 10000,
});

apiInstance.interceptors.request.use(
  (config) => {
    const state = useSessionStore.getState();
    const token = state.user?.token;

    // إذا كان التحميل جارٍ (refresh أولي) ننتظر انتهاء SessionInitializer حتى لا نرسل طلب بدون توكن
    if (!token && state.isLoading) {
      return new Promise((resolve) => {
        const unsub = useSessionStore.subscribe((s) => {
          if (!s.isLoading) {
            const tk = s.user?.token;
            if (tk) {
              (config.headers as any).Authorization = `Bearer ${tk}`;
            }
            unsub();
            resolve(config);
          }
        });
      });
    }

    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }

    if (config.data && !(config.data instanceof FormData)) {
      (config.headers as any)["Content-Type"] = "application/json";
      config.data = humps.decamelizeKeys(config.data);
    }
    // إذا كانت FormData نضمن حذف أي Content-Type سابق لتركه للمتصفح
    if (config.data instanceof FormData) {
      if (config.headers && (config.headers as any)["Content-Type"]) {
        delete (config.headers as any)["Content-Type"];
      }
    }
    if (config.params) {
      config.params = humps.decamelizeKeys(config.params);
    }
    return config;
  },
  (error) => Promise.reject(error)
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
