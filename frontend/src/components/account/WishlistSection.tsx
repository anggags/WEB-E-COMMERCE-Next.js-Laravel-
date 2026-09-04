"use client";

import Image from "next/image";
import Link from "next/link";
import { useWishlistStore } from "@/store/wishlistStore";
import { formatIDR } from "@/lib/format";

export default function WishlistSection() {
  const { items, toggle, status } = useWishlistStore();

  if (status === "loading" || status === "idle") {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
    ))}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500">
        <p>Belum ada produk favorit.</p>
        <Link href="/products" className="mt-3 inline-block text-sm font-medium text-amber-600 hover:underline">
          Jelajahi Produk
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const p = item.product;
        const img = p.images?.[0]?.url;
        return (
          <div key={item.id} className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-white p-4">
            <Link href={`/products/${p.slug}`} className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-zinc-100">
              {img ? (
                <Image src={img} alt={p.name} fill sizes="64px" className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-zinc-300">No Img</div>
              )}
            </Link>
            <div className="min-w-0 flex-1">
              <Link href={`/products/${p.slug}`} className="text-sm font-medium text-zinc-900 hover:underline line-clamp-1">
                {p.name}
              </Link>
              <p className="text-sm font-semibold text-amber-600">{formatIDR(p.price)}</p>
              {p.stock <= 0 && <p className="text-xs text-red-500">Stok habis</p>}
            </div>
            <button
              onClick={() => toggle(p.id)}
              className="shrink-0 rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              Hapus
            </button>
          </div>
        );
      })}
    </div>
  );
}
