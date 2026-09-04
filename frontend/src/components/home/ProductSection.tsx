"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiGet } from "@/lib/api";
import type { PaginatedResponse, Product } from "@/types";
import { useAsyncData } from "@/hooks/useAsyncData";
import ProductCard from "@/components/products/ProductCard";

gsap.registerPlugin(ScrollTrigger);

type Sort = "newest" | "best_selling";
const TABS: { key: Sort; label: string }[] = [
  { key: "newest", label: "Terbaru" },
  { key: "best_selling", label: "Terlaris" },
];

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-white"
        >
          <div className="aspect-square bg-zinc-200" />
          <div className="space-y-2 p-4">
            <div className="h-3 w-3/4 rounded bg-zinc-200" />
            <div className="h-4 w-1/2 rounded bg-zinc-100" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductSection() {
  const root = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<Sort>("newest");

  const { data, loading, error, refetch } = useAsyncData<Product[]>(
    () =>
      apiGet<PaginatedResponse<Product>>(`/products?per_page=8&sort=${sort}`).then(
        (r) => r.data,
      ),
    [sort],
  );

  // Restart reveal animation whenever data changes
  useEffect(() => {
    if (loading || data === null) return;
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const targets = el.querySelectorAll("[data-prod-card]");
      gsap.fromTo(
        targets,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [loading, data]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-amber-600">Produk</p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">
            Pilihan Terbaik
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-zinc-200 bg-white p-1">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSort(tab.key)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  sort === tab.key
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-500 hover:text-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <Link
            href="/products"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            Lihat Semua →
          </Link>
        </div>
      </div>

      <div ref={root} className="mt-8">
        {loading && <ProductGridSkeleton />}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error && data && data.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.map((product) => (
              <div key={product.id} data-prod-card className="opacity-0">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {!loading && !error && data && data.length === 0 && (
          <div className="text-zinc-500">Belum ada produk.</div>
        )}
      </div>
    </section>
  );
}
