"use client";

import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { extractError } from "@/lib/api";
import type { Product } from "@/types";

export default function AddToCartButton({ product }: { product: Product }) {
  const router = useRouter();
  const { status } = useAuthStore();
  const { addItem } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await addItem(product.id, 1);
    } catch (e) {
      setError(extractError(e).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleAdd}
        disabled={loading || product.stock <= 0}
        className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Menambahkan..." : product.stock <= 0 ? "Stok Habis" : "Masukkan ke Keranjang"}
      </button>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </>
  );
}
