"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { formatIDR } from "@/lib/format";

export default function CartClient() {
  const router = useRouter();
  const { cart, updateItem, removeItem, clearCart, fetchCart, status } =
    useCartStore();
  const { status: authStatus } = useAuthStore();

  useEffect(() => {
    if (authStatus === "authenticated" && status === "idle") fetchCart();
  }, [authStatus, status, fetchCart]);

  const items = cart?.items ?? [];

  if (authStatus === "unauthenticated") {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Masuk Diperlukan</h1>
        <p className="mt-2 text-zinc-500">Login untuk melihat keranjang Anda.</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-6 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white"
        >
          Masuk
        </button>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Keranjang Kosong</h1>
        <p className="mt-2 text-zinc-500">
          Belum ada produk di keranjang Anda.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white"
        >
          Belanja Sekarang
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900">Keranjang</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {items.map((item) => {
            const name = item.product?.name ?? `Produk #${item.id}`;
            const image = item.product?.images?.[0]?.url;
            const variantLabel = item.variant?.name ?? "";
            return (
              <li
                key={item.id}
                className="flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                  {image ? (
                    <Image src={image} alt={name} fill sizes="96px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-zinc-300">
                      No Img
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/products/${item.product?.slug ?? ""}`}
                    className="text-sm font-medium text-zinc-900 hover:underline"
                  >
                    {name}
                  </Link>
                  {variantLabel && (
                    <span className="text-xs text-zinc-500">{variantLabel}</span>
                  )}
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-3">
                    <div className="inline-flex items-center rounded-full border border-zinc-300">
                      <button
                        onClick={() => updateItem(item.id, item.qty - 1)}
                        disabled={item.qty <= 1}
                        className="px-3 py-1.5 text-sm disabled:opacity-30"
                      >
                        −
                      </button>
                      <span className="min-w-8 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateItem(item.id, item.qty + 1)}
                        className="px-3 py-1.5 text-sm"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-base font-semibold text-zinc-900">
                      {formatIDR(item.subtotal)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  aria-label="Hapus"
                  className="self-start p-1 text-zinc-400 transition-colors hover:text-red-500"
                >
                  <TrashIcon />
                </button>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-zinc-900">Ringkasan</h2>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-zinc-600">Jumlah Item</span>
            <span className="text-sm font-medium text-zinc-900">
              {cart?.qty ?? 0}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-3">
            <span className="text-zinc-900">Total</span>
            <span className="text-xl font-bold text-zinc-900">
              {formatIDR(cart?.total ?? 0)}
            </span>
          </div>

          <button
            onClick={() => router.push("/checkout")}
            className="mt-5 w-full rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Checkout
          </button>
          <button
            onClick={clearCart}
            className="mt-2 w-full rounded-full border border-zinc-300 py-3 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Kosongkan Keranjang
          </button>
        </aside>
      </div>
    </div>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
      />
    </svg>
  );
}
