import { create } from "zustand";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import type { ApiResponse, WishlistItem } from "@/types";

interface WishlistState {
  items: WishlistItem[];
  status: "idle" | "loading" | "ready";
  /** product_id -> wishlist item id (for quick lookup + delete) */
  map: Record<number, number>;
  fetchWishlist: () => Promise<void>;
  toggle: (productId: number) => Promise<void>;
  isWishlisted: (productId: number) => boolean;
}

function buildMap(items: WishlistItem[]): Record<number, number> {
  const map: Record<number, number> = {};
  for (const it of items) {
    if (it.product) map[it.product.id] = it.id;
  }
  return map;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  status: "idle",
  map: {},

  async fetchWishlist() {
    set({ status: "loading" });
    try {
      const res = await apiGet<ApiResponse<WishlistItem[]>>("/wishlist");
      set({ items: res.data, status: "ready", map: buildMap(res.data) });
    } catch {
      set({ items: [], status: "ready", map: {} });
    }
  },

  async toggle(productId) {
    const existing = get().map[productId];
    if (existing) {
      await apiDelete(`/wishlist/${existing}`);
      set({
        items: get().items.filter((i) => i.id !== existing),
        map: Object.fromEntries(
          Object.entries(get().map).filter(([, id]) => id !== existing),
        ),
      });
    } else {
      const res = await apiPost<ApiResponse<WishlistItem>>("/wishlist", {
        product_id: productId,
      });
      set({
        items: [res.data, ...get().items],
        map: { ...get().map, [productId]: res.data.id },
      });
    }
  },

  isWishlisted(productId) {
    return productId in get().map;
  },
}));