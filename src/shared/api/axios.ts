import { useSessionStore } from "@/entities/session/model/sessionStore";
import axios, { AxiosError } from "axios";
import humps from "humps";
// Prevent multiple concurrent sign-out redirects on burst of 401s
let isSigningOut = false;
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
    // If server returns HTML/text (e.g., reports), keep it as-is
    const contentType = (response.headers as any)?.["content-type"] as
      | string
      | undefined;
    const isTextLike =
      typeof response.data === "string" ||
      (contentType && contentType.includes("text/html"));
    if (response.data && !isTextLike) {
      response.data = humps.camelizeKeys(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      // Clear client session and cookies, then route to /login.
      // If we only navigate without signing out, middleware may still see a stale token and redirect to "/".
      if (typeof window !== "undefined" && !isSigningOut) {
        isSigningOut = true;
        try {
          // Clear local session store immediately
          const state = useSessionStore.getState();
          state.setUser(null);
          // Dynamically import to avoid SSR issues
          const { signOut } = await import("next-auth/react");
          await signOut({ redirect: false });
        } catch (_) {
          // no-op: even if signOut fails, still push to login
        } finally {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);
