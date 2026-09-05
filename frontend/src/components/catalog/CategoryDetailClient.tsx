"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiGet } from "@/lib/api";
import type { ApiResponse, Category, PaginatedResponse, Product } from "@/types";
import { useAsyncData } from "@/hooks/useAsyncData";
import ProductCard from "@/components/products/ProductCard";

gsap.registerPlugin(ScrollTrigger);

export default function CategoryDetailClient({
  slug,
  initialCategory = null,
}: {
  slug: string;
  initialCategory?: Category | null;
}) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [sub, setSub] = useState("");

  const { data: category } = useAsyncData<Category[]>(
    () =>
      apiGet<ApiResponse<Category[]>>("/categories").then((r) =>
        r.data.filter((c) => c.parent_id === null),
      ),
  );

  const current = category?.find((c) => c.slug === slug) ?? initialCategory;
  const subs = current?.children ?? [];

  const { data, loading, error, refetch } = useAsyncData<{
    products: Product[];
    total: number;
  }>(
    () =>
      apiGet<PaginatedResponse<Product>>(
        `/categories/${slug}/products?per_page=24`,
      ).then((r) => ({
        // If a subcategory is selected, filter client-side (endpoint only
        // returns the parent category products)
        products: sub
          ? r.data.filter((p) => p.category?.id === Number(sub))
          : r.data,
        total: r.meta.total,
      })),
    [slug, sub],
  );

  useEffect(() => {
    if (loading || !data) return;
    const el = gridRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-card]"),
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.05,
        },
      );
    }, el);
    return () => ctx.revert();
  }, [loading, data]);

  const products = data?.products ?? [];

  if (!current) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-8 w-1/2 animate-pulse rounded bg-zinc-200" />
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-[#1c1c22]"
            >
              <div className="aspect-square bg-zinc-200" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-3/4 rounded bg-zinc-200" />
                <div className="h-4 w-1/2 rounded bg-zinc-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">{current.name}</h1>

      {subs.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2">
          <button
            onClick={() => setSub("")}
            className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
              sub === ""
                ? "border-white bg-white text-[#121212]"
                : "border-zinc-300 text-zinc-600 hover:border-zinc-900"
            }`}
          >
            Semua
          </button>
          {subs.map((s) => (
            <button
              key={s.id}
              onClick={() => setSub(String(s.id))}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                sub === String(s.id)
                  ? "border-white bg-white text-[#121212]"
                  : "border-zinc-300 text-zinc-600 hover:border-zinc-900"
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      )}

      <div ref={gridRef} className="mt-8">
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-[#1c1c22]"
              >
                <div className="aspect-square bg-zinc-200" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-3/4 rounded bg-zinc-200" />
                  <div className="h-4 w-1/2 rounded bg-zinc-100" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <div key={product.id} data-card className="opacity-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500">
            Belum ada produk pada kategori ini.
          </div>
        )}
      </div>
    </div>
  );
}
