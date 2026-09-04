import { create } from "zustand";
import {
  apiGet,
  apiPost,
  bootstrapCsrf,
  clearToken,
  getToken,
  setToken,
} from "@/lib/api";
import type { ApiResponse, User } from "@/types";

interface AuthState {
  user: User | null;
  status: "idle" | "loading" | "authenticated" | "unauthenticated";
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  status: typeof window !== "undefined" && getToken() ? "loading" : "unauthenticated",

  async login(email, password) {
    await bootstrapCsrf();
    const res = await apiPost<ApiResponse<User> & { token: string }>("/login", {
      email,
      password,
    });
    setToken(res.token);
    set({ user: res.data, status: "authenticated" });
  },

  async register(name, email, password) {
    await bootstrapCsrf();
    const res = await apiPost<ApiResponse<User> & { token: string }>("/register", {
      name,
      email,
      password,
      password_confirmation: password,
    });
    setToken(res.token);
    set({ user: res.data, status: "authenticated" });
  },

  async logout() {
    try {
      await apiPost("/logout");
    } finally {
      clearToken();
      set({ user: null, status: "unauthenticated" });
    }
  },

  async fetchUser() {
    const token = getToken();
    if (!token) {
      set({ user: null, status: "unauthenticated" });
      return;
    }
    try {
      const res = await apiGet<ApiResponse<User>>("/me");
      set({ user: res.data, status: "authenticated" });
    } catch {
      clearToken();
      set({ user: null, status: "unauthenticated" });
    }
  },

  setUser(user) {
    set({ user });
    if (user) set({ status: "authenticated" });
    else set({ status: "unauthenticated" });
  },
}));
