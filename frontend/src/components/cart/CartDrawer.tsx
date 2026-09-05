"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { useToastStore } from "@/store/toastStore";
import { formatIDR } from "@/lib/format";

export default function CartDrawer() {
  const router = useRouter();
  const { cart, updateItem, removeItem, status } = useCartStore();
  const { cartOpen, closeCart } = useUIStore();
  const addToast = useToastStore((s) => s.addToast);

  const panelRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll when drawer open
  useEffect(() => {
    if (cartOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [cartOpen]);

  // GSAP animate in/out
  useEffect(() => {
    if (!panelRef.current || !backdropRef.current) return;
    if (cartOpen) {
      gsap.set(panelRef.current, { x: "0%" });
      gsap.set(backdropRef.current, { opacity: 1, display: "block" });
      gsap.fromTo(panelRef.current, { x: "100%" }, { x: "0%", duration: 0.35, ease: "power3.out" });
      gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.25 });
    } else {
      gsap.to(panelRef.current, { x: "100%", duration: 0.25, ease: "power2.in" });
      gsap.to(backdropRef.current, { opacity: 0, duration: 0.2 });
    }
  }, [cartOpen]);

  const items = cart?.items ?? [];

  function handleRemove(id: number, name: string) {
    removeItem(id);
    addToast(`${name} dihapus dari keranjang`, "info");
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ pointerEvents: cartOpen ? "auto" : "none" }}
    >
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={closeCart}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        style={{ opacity: 0 }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative flex h-full w-full max-w-md flex-col bg-[#151519] shadow-xl"
        style={{ transform: "translateX(100%)" }}
      >
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-lg font-bold text-zinc-900">
            Keranjang ({cart?.items_count ?? 0})
          </h2>
          <button
            onClick={closeCart}
            aria-label="Tutup keranjang"
            className="rounded-full p-2 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <CloseIcon />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-300">
              <EmptyCartIcon />
            </div>
            <p className="text-zinc-500">Keranjang Anda kosong.</p>
            <button
              onClick={closeCart}
              className="rounded-full bg-white text-[#121212] px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              <ul className="space-y-4">
                {items.map((item) => {
                  const name = item.product?.name ?? `Produk #${item.id}`;
                  const image = item.product?.images?.[0]?.url;
                  const variantLabel = item.variant?.name ?? "";
                  return (
                    <li key={item.id} className="flex gap-3 rounded-xl p-2 transition-colors hover:bg-zinc-50">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
                        {image ? (
                          <Image src={image} alt={name} fill sizes="80px" className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-300">No Img</div>
                        )}
                      </div>

                      <div className="flex flex-1 flex-col">
                        <Link
                          href={`/products/${item.product?.slug ?? ""}`}
                          onClick={closeCart}
                          className="text-sm font-medium text-zinc-900 hover:underline"
                        >
                          {name}
                        </Link>
                        {variantLabel && <span className="text-xs text-zinc-500">{variantLabel}</span>}
                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="inline-flex items-center rounded-full border border-zinc-300">
                            <button
                              onClick={() => updateItem(item.id, item.qty - 1)}
                              disabled={item.qty <= 1}
                              className="px-2.5 py-1 text-sm transition-colors hover:bg-zinc-100 disabled:opacity-30"
                            >
                              −
                            </button>
                            <span className="min-w-6 text-center text-xs font-semibold">{item.qty}</span>
                            <button
                              onClick={() => updateItem(item.id, item.qty + 1)}
                              className="px-2.5 py-1 text-sm transition-colors hover:bg-zinc-100"
                            >
                              +
                            </button>
                          </div>
                          <p className="text-sm font-semibold text-zinc-900">{formatIDR(item.subtotal)}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleRemove(item.id, name)}
                        aria-label="Hapus item"
                        className="self-start rounded-full p-1 text-zinc-400 transition-colors hover:bg-red-50 hover:text-red-500"
                      >
                        <TrashIcon />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-zinc-200 px-5 py-4">
              <div className="flex items-center justify-between text-base">
                <span className="text-zinc-600">Total</span>
                <span className="text-xl font-bold text-zinc-900">{formatIDR(cart?.total ?? 0)}</span>
              </div>
              <button
                onClick={() => {
                  closeCart();
                  router.push("/checkout");
                }}
                disabled={status !== "ready" || items.length === 0}
                className="mt-4 w-full rounded-full bg-white text-[#121212] py-3.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Checkout
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}

function EmptyCartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-10 w-10">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}
