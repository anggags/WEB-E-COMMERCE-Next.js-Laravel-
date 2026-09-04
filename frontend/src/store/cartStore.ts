import { create } from "zustand";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import type { ApiResponse, Cart } from "@/types";

interface CartState {
  cart: Cart | null;
  status: "idle" | "loading" | "ready";
  fetchCart: () => Promise<void>;
  addItem: (productId: number, qty?: number, variantId?: number) => Promise<void>;
  updateItem: (itemId: number, qty: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  reset: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: null,
  status: "idle",

  async fetchCart() {
    set({ status: "loading" });
    try {
      const res = await apiGet<ApiResponse<Cart>>("/cart");
      set({ cart: res.data, status: "ready" });
    } catch {
      set({ cart: null, status: "ready" });
    }
  },

  async addItem(productId, qty = 1, variantId) {
    const res = await apiPost<ApiResponse<Cart>>("/cart/items", {
      product_id: productId,
      qty,
      ...(variantId ? { variant_id: variantId } : {}),
    });
    set({ cart: res.data });
  },

  async updateItem(itemId, qty) {
    const res = await apiPut<ApiResponse<Cart>>(`/cart/items/${itemId}`, { qty });
    set({ cart: res.data });
  },

  async removeItem(itemId) {
    const res = await apiDelete<ApiResponse<Cart>>(`/cart/items/${itemId}`);
    set({ cart: res.data });
  },

  async clearCart() {
    const res = await apiDelete<ApiResponse<Cart>>("/cart");
    set({ cart: res.data });
  },

  reset() {
    set({ cart: null, status: "idle" });
  },
}));
