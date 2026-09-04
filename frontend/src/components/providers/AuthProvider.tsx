"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

/**
 * Hydrates auth + cart + wishlist state from the backend on initial client mount.
 */
export default function AuthProvider() {
  const { status, fetchUser } = useAuthStore();
  const {
    status: cartStatus,
    fetchCart,
  } = useCartStore();
  const {
    status: wishStatus,
    fetchWishlist,
  } = useWishlistStore();

  useEffect(() => {
    if (status === "loading") fetchUser();
  }, [status, fetchUser]);

  useEffect(() => {
    if (status === "authenticated" && cartStatus === "idle") fetchCart();
  }, [status, cartStatus, fetchCart]);

  useEffect(() => {
    if (status === "authenticated" && wishStatus === "idle") fetchWishlist();
  }, [status, wishStatus, fetchWishlist]);

  return null;
}
