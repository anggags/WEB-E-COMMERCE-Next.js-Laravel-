"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiGet } from "@/lib/api";
import type { ApiResponse, Category } from "@/types";
import { useAsyncData } from "@/hooks/useAsyncData";

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=900&q=80",
];

function SkeletonPoster() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl bg-white/5">
      <div className="aspect-[3/4] bg-white/5" />
      <div className="h-3 w-1/2 rounded bg-white/5" />
    </div>
  );
}

export default function CategorySection() {
  const root = useRef<HTMLElement>(null);
  const { data, loading, error, refetch } = useAsyncData<Category[]>(() =>
    apiGet<ApiResponse<Category[]>>("/categories").then((r) =>
      r.data.filter((c: Category) => c.parent_id === null),
    ),
  );

  const categories = (data ?? []).slice(0, 8);

  useEffect(() => {
    if (loading || data === null) return;
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-cat-card]"),
        { y: 48, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.1,
          scrollTrigger: { trigger: el, start: "top 78%" },
        },
      );
      gsap.fromTo(
        ".cat-heading > *",
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 80%" },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [loading, data]);

  return (
    <section ref={root} className="bg-[#121212] py-24 text-white sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-accent">
              Koleksi
            </p>
            <h2 className="cat-heading mt-5 font-display text-6xl font-medium uppercase leading-none sm:text-8xl lg:text-9xl">
              <span className="block overflow-hidden pb-1">Jelajahi</span>
              <span className="block overflow-hidden pb-1">
                <span className="italic text-accent">Rak</span> Kami
              </span>
            </h2>
          </div>
          <Link
            href="/categories"
            className="group inline-flex items-center gap-3 border-b border-white/30 pb-1 text-xs font-extrabold uppercase tracking-[0.25em] text-white/70 transition-colors hover:border-accent hover:text-accent"
          >
            Semua Kategori
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        </div>

        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {loading &&
            Array.from({ length: 4 }).map((_, i) => <SkeletonPoster key={i} />)}

          {!loading && error && (
            <div className="col-span-full rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
              <p className="text-sm text-white/70">{error}</p>
              <button
                onClick={refetch}
                className="mt-4 border-b border-accent pb-1 text-xs font-extrabold uppercase tracking-[0.25em] text-accent"
              >
                Coba Lagi
              </button>
            </div>
          )}

          {!loading && !error &&
            categories.map((cat, i) => (
              <div key={cat.id} data-cat-card className="opacity-0">
                <Link href={`/categories/${cat.slug}`} className="group block">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-white/5">
                    <div
                      className="absolute inset-0 bg-cover bg-center grayscale transition-all duration-700 group-hover:scale-110 group-hover:grayscale-0"
                      style={{
                        backgroundImage: `url(${FALLBACK_IMAGES[i % FALLBACK_IMAGES.length]})`,
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/10 to-transparent" />
                    <span className="absolute left-4 top-4 font-display text-3xl font-medium italic text-white/60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="absolute inset-x-0 bottom-0 p-5">
                      <p className="font-display text-2xl font-medium uppercase leading-none text-white sm:text-3xl">
                        {cat.name}
                      </p>
                      {typeof cat.products_count === "number" && (
                        <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.2em] text-white/50">
                          {cat.products_count} Produk
                        </p>
                      )}
                      <span className="mt-3 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.25em] text-accent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        Buka
                        <span className="transition-transform duration-300 group-hover:translate-x-1">
                          →
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}

          {!loading && !error && categories.length === 0 && (
            <div className="col-span-full text-white/50">Belum ada kategori.</div>
          )}
        </div>
      </div>
    </section>
  );
}