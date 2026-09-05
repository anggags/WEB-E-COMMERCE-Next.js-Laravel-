"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiGet, extractError } from "@/lib/api";
import type { PaginatedResponse, Product } from "@/types";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useToastStore } from "@/store/toastStore";
import { formatIDR } from "@/lib/format";

gsap.registerPlugin(ScrollTrigger);

type Sort = "newest" | "best_selling";
const TABS: { key: Sort; label: string }[] = [
  { key: "newest", label: "Terbaru" },
  { key: "best_selling", label: "Terlaris" },
];

function PosterSkeleton() {
  return (
    <div className="w-[78vw] shrink-0 snap-start sm:w-[42vw] lg:w-[27vw]">
      <div className="aspect-[3/4] animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}

function Arrow({ dir, onClick }: { dir: "left" | "right"; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={`Geser ${dir === "left" ? "kiri" : "kanan"}`}
      className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white transition-colors hover:border-accent hover:text-accent"
    >
      {dir === "left" ? "←" : "→"}
    </button>
  );
}

export default function ProductSection() {
  const root = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [sort, setSort] = useState<Sort>("newest");

  const router = useRouter();
  const { status } = useAuthStore();
  const { addItem } = useCartStore();
  const addToast = useToastStore((s) => s.addToast);
  const [addingId, setAddingId] = useState<number | null>(null);

  const { data, loading, error, refetch } = useAsyncData<Product[]>(
    () =>
      apiGet<PaginatedResponse<Product>>(`/products?per_page=8&sort=${sort}`).then(
        (r) => r.data,
      ),
    [sort],
  );

  useEffect(() => {
    if (loading || data === null) return;
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-prod-card]"),
        { y: 56, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 72%" },
        },
      );
      gsap.fromTo(
        ".prod-heading > *",
        { yPercent: 110 },
        {
          yPercent: 0,
          duration: 1,
          ease: "power4.out",
          stagger: 0.08,
          scrollTrigger: { trigger: el, start: "top 72%" },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [loading, data]);

  function scrollTrack(dir: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: "smooth" });
  }

  async function onAdd(product: Product) {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setAddingId(product.id);
    try {
      await addItem(product.id, 1);
      addToast(`${product.name} ditambahkan ke keranjang`, "success");
    } catch (e) {
      addToast(extractError(e).message, "error");
    } finally {
      setAddingId(null);
    }
  }

  const products = data ?? [];

  return (
    <section ref={root} className="bg-[#121212] py-24 text-white sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.35em] text-accent">
              Produk
            </p>
            <h2 className="prod-heading mt-5 font-display text-6xl font-medium uppercase leading-none sm:text-8xl lg:text-9xl">
              <span className="block overflow-hidden pb-1">Pilihan</span>
              <span className="block overflow-hidden italic pb-1 text-accent">
                Terbaik.
              </span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="inline-flex items-center gap-6 text-[11px] font-extrabold uppercase tracking-[0.25em]">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setSort(tab.key)}
                  className={`pb-1 transition-colors ${
                    sort === tab.key
                      ? "border-b border-accent text-white"
                      : "border-b border-transparent text-white/40 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Arrow dir="left" onClick={() => scrollTrack(-1)} />
              <Arrow dir="right" onClick={() => scrollTrack(1)} />
            </div>
          </div>
        </div>
      </div>

      <div ref={trackRef} className="mt-14 flex gap-5 overflow-x-auto scroll-smooth px-4 pb-4 sm:px-6 [scrollbar-width:none] lg:px-8 [&::-webkit-scrollbar]:hidden">
        {loading &&
          Array.from({ length: 4 }).map((_, i) => <PosterSkeleton key={i} />)}

        {!loading && error && (
          <div className="mx-auto w-full max-w-md rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
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
          products.map((product, i) => (
            <div
              key={product.id}
              data-prod-card
              className="w-[78vw] shrink-0 snap-start opacity-0 sm:w-[42vw] lg:w-[27vw]"
            >
              <div className="group relative overflow-hidden rounded-2xl bg-white/5">
                <Link href={`/products/${product.slug}`} className="block">
                  <div className="relative aspect-[3/4] w-full overflow-hidden">
                    {product.images?.[0]?.url ? (
                      <Image
                        src={product.images[0].url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 78vw, (max-width: 1024px) 42vw, 27vw"
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/20">
                        No Image
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-[#121212]/20" />
                    <span className="absolute left-4 top-4 font-display text-3xl font-medium italic text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                </Link>

                <button
                  onClick={() => onAdd(product)}
                  disabled={product.stock <= 0}
                  className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white text-[#121212] opacity-0 shadow-lg transition-all duration-300 hover:bg-accent hover:text-white group-hover:opacity-100 disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label={`Tambahkan ${product.name} ke keranjang`}
                >
                  {addingId === product.id ? "…" : "+"}
                </button>

                <div className="p-5">
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-white/40">
                    {product.category?.name ?? "Produk"}
                  </p>
                  <Link
                    href={`/products/${product.slug}`}
                    className="mt-2 block font-display text-2xl font-medium uppercase leading-none text-white sm:text-3xl"
                  >
                    {product.name}
                  </Link>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-display text-xl font-semibold text-accent sm:text-2xl">
                      {formatIDR(product.price)}
                    </span>
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/40">
                      {product.stock > 0 ? "Stok Tersedia" : "Habis"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}

        {!loading && !error && products.length === 0 && (
          <div className="mx-auto text-white/50">Belum ada produk.</div>
        )}
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl items-center justify-between px-4 sm:hidden">
        <Arrow dir="left" onClick={() => scrollTrack(-1)} />
        <Arrow dir="right" onClick={() => scrollTrack(1)} />
      </div>

      <div className="mx-auto mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <Link
          href="/products"
          className="group inline-flex items-center gap-3 border-b border-white/30 pb-1 text-xs font-extrabold uppercase tracking-[0.25em] text-white/70 transition-colors hover:border-accent hover:text-accent"
        >
          Seluruh Produk
          <span className="transition-transform duration-300 group-hover:translate-x-1.5">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}