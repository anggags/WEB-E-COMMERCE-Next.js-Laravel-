import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

// Laravel Sanctum's CSRF endpoint lives at the app root (not under /api)
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:8000";

let csrfReady = false;

/**
 * Sanctum's SPA-token flow: fetch the XSRF-TOKEN cookie so that the
 * subsequent login request passes CSRF validation. Safe to call multiple
 * times; axios reads the cookie automatically via `withCredentials`.
 */
export async function bootstrapCsrf(): Promise<void> {
  if (csrfReady || typeof window === "undefined") return;
  try {
    await axios.get(`${APP_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    csrfReady = true;
  } catch {
    // Non-fatal; token-based requests generally don't depend on the cookie.
  }
}

const TOKEN_KEY = "ecommerce_token";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(TOKEN_KEY, token);
};

export const clearToken = (): void => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(TOKEN_KEY);
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
    const status = error.response?.status;
    if (status === 401) {
      clearToken();
    }
    return Promise.reject(error);
  },
);

export interface ApiError {
  status?: number;
  message: string;
  errors?: Record<string, string[]>;
}

export function extractError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    return {
      status: error.response?.status,
      message:
        data?.message ??
        (typeof data === "string" ? data : "Terjadi kesalahan. Silakan coba lagi."),
      errors: data?.errors,
    };
  }
  return { message: "Terjadi kesalahan. Silakan coba lagi." };
}

export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.get<T>(url, config);
  return res.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await api.post<T>(url, data, config);
  return res.data;
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const res = await api.put<T>(url, data, config);
  return res.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  const res = await api.delete<T>(url, config);
  return res.data;
}
