"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product } from "@/types";
import { formatIDR } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useToastStore } from "@/store/toastStore";
import { extractError } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const { status } = useAuthStore();
  const { addItem } = useCartStore();
  const { isWishlisted, toggle } = useWishlistStore();
  const addToast = useToastStore((s) => s.addToast);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wishAnim, setWishAnim] = useState(false);

  const wishlisted = isWishlisted(product.id);
  const image = product.images?.[0]?.url;

  function onWishlist() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setWishAnim(true);
    setTimeout(() => setWishAnim(false), 400);
    toggle(product.id)
      .then(() => {
        addToast(
          wishlisted ? "Dihapus dari favorit" : "Ditambahkan ke favorit",
          wishlisted ? "info" : "success",
        );
      })
      .catch(() => {});
  }

  async function onQuickAdd() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setAdding(true);
    setError(null);
    try {
      await addItem(product.id, 1);
      setAdded(true);
      addToast(`${product.name} ditambahkan ke keranjang`, "success");
      setTimeout(() => setAdded(false), 1500);
    } catch (e) {
      setError(extractError(e).message);
      addToast(extractError(e).message, "error");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-zinc-200 bg-[#1c1c22] shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square w-full overflow-hidden bg-zinc-100">
          {image ? (
            <Image
              src={image}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-300">No Image</div>
          )}

          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        </div>
      </Link>

      {/* Quick add + wishlist */}
      <div className="absolute right-3 top-3 z-10 flex flex-col items-center gap-2">
        <button
          onClick={onWishlist}
          aria-label="Tambahkan ke favorit"
          className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-200 ${
            wishlisted
              ? "bg-red-500 text-white scale-110"
              : "bg-white text-zinc-700 opacity-0 hover:bg-white hover:text-[#121212] group-hover:opacity-100"
          } ${wishAnim ? "animate-pop" : ""}`}
        >
          <HeartIcon filled={wishlisted} />
        </button>
        <button
          onClick={onQuickAdd}
          disabled={adding || product.stock <= 0}
          aria-label="Tambahkan ke keranjang"
          className={`flex h-10 w-10 items-center justify-center rounded-full shadow-md transition-all duration-200 ${
            added
              ? "bg-green-500 text-white scale-110"
              : "bg-white text-zinc-700 opacity-0 hover:bg-white hover:text-[#121212] group-hover:opacity-100"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          {added ? <CheckIcon /> : <CartPlusIcon />}
        </button>
      </div>

      {/* Stock badge */}
      {product.stock <= 5 && product.stock > 0 && (
        <div className="absolute left-3 top-3 z-10">
          <span className="rounded-full bg-amber-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            Sisa {product.stock}
          </span>
        </div>
      )}
      {product.stock === 0 && (
        <div className="absolute left-3 top-3 z-10">
          <span className="rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-sm">
            Habis
          </span>
        </div>
      )}

      <Link href={`/products/${product.slug}`} className="block p-4">
        <h3 className="text-sm font-medium text-zinc-900 line-clamp-1">{product.name}</h3>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-sm font-semibold text-amber-600">{formatIDR(product.price)}</p>
          {Number(product.avg_rating) > 0 && (
            <span className="flex items-center gap-0.5 text-xs text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-amber-400">
                <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
              </svg>
              {Number(product.avg_rating).toFixed(1)}
            </span>
          )}
        </div>
      </Link>

      {error && <div className="px-4 pb-3 text-xs text-red-500">{error}</div>}
    </div>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
    </svg>
  );
}

function CartPlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
  );
}
