"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiGet } from "@/lib/api";
import type { ApiResponse, Category } from "@/types";
import { useAsyncData } from "@/hooks/useAsyncData";

gsap.registerPlugin(ScrollTrigger);

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-white">
      <div className="aspect-[4/5] bg-zinc-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-3/4 rounded bg-zinc-200" />
        <div className="h-3 w-1/2 rounded bg-zinc-100" />
      </div>
    </div>
  );
}

function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      href={`/categories/${category.slug}`}
      className="group relative block aspect-[4/5] overflow-hidden rounded-2xl bg-zinc-200"
    >
      <div className="absolute inset-0 flex items-end bg-gradient-to-t from-zinc-950/80 via-zinc-950/20 to-transparent p-5 transition-transform duration-500 group-hover:scale-105">
        <div className="transition-transform duration-500 group-hover:-translate-y-1">
          <p className="text-lg font-semibold text-white">{category.name}</p>
          {category.children && category.children.length > 0 && (
            <p className="mt-1 text-xs text-zinc-300">
              {category.children.length} subkategori
            </p>
          )}
          <span className="mt-3 inline-block text-xs font-medium text-amber-300 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Jelajahi →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function CategorySection() {
  const root = useRef<HTMLDivElement>(null);
  const { data, loading, error, refetch } = useAsyncData<Category[]>(() =>
    apiGet<ApiResponse<Category[]>>("/categories").then((r) =>
      r.data.filter((c: Category) => c.parent_id === null),
    ),
  );

  const visibleCategories = (data ?? []).slice(0, 8);

  // Stagger reveal on scroll
  useEffect(() => {
    if (loading || data === null) return;
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-cat-card]"),
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [loading, data]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-sm font-medium text-amber-600">Kategori</p>
          <h2 className="mt-1 text-2xl font-bold text-zinc-900 sm:text-3xl">
            Kategori Unggulan
          </h2>
        </div>
        <Link
          href="/categories"
          className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
        >
          Semua Kategori →
        </Link>
      </div>

      <div ref={root} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}

        {!loading && error && (
          <div className="col-span-full rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <button
              onClick={refetch}
              className="mt-3 rounded-full bg-red-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {!loading && !error &&
          visibleCategories.map((cat) => (
            <div key={cat.id} data-cat-card className="opacity-0">
              <CategoryCard category={cat} />
            </div>
          ))}

        {!loading && !error && visibleCategories.length === 0 && (
          <div className="col-span-full text-zinc-500">Belum ada kategori.</div>
        )}
      </div>
    </section>
  );
}
