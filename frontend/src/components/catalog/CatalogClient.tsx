"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { apiGet } from "@/lib/api";
import type { Category, PaginatedResponse, Product } from "@/types";
import { useAsyncData } from "@/hooks/useAsyncData";
import ProductCard from "@/components/products/ProductCard";

gsap.registerPlugin(ScrollTrigger);

const SORTS = [
  { key: "", label: "Terbaru" },
  { key: "price_asc", label: "Harga Terendah" },
  { key: "price_desc", label: "Harga Tertinggi" },
  { key: "best_selling", label: "Terlaris" },
];

const PER_PAGE = 24;

const RATING_OPTIONS = [
  { value: 4, label: "4+" },
  { value: 3, label: "3+" },
  { value: 2, label: "2+" },
  { value: 1, label: "1+" },
];

function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-[#1c1c22]">
      <div className="aspect-square bg-zinc-200" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-3/4 rounded bg-zinc-200" />
        <div className="h-4 w-1/2 rounded bg-zinc-100" />
      </div>
    </div>
  );
}

export default function CatalogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const gridRef = useRef<HTMLDivElement>(null);

  // State derived from URL
  const urlSearch = searchParams.get("q") ?? "";
  const urlCategory = searchParams.get("category") ?? "";
  const urlSort = searchParams.get("sort") ?? "";
  const urlMinPrice = searchParams.get("min_price") ?? "";
  const urlMaxPrice = searchParams.get("max_price") ?? "";
  const urlRating = searchParams.get("rating") ?? "";

  const [search, setSearch] = useState(urlSearch);
  const [category, setCategory] = useState(urlCategory);
  const [sort, setSort] = useState(urlSort);
  const [minPrice, setMinPrice] = useState(urlMinPrice);
  const [maxPrice, setMaxPrice] = useState(urlMaxPrice);
  const [rating, setRating] = useState(urlRating);
  const [page, setPage] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceInputs, setPriceInputs] = useState({ min: urlMinPrice, max: urlMaxPrice });

  const query = new URLSearchParams();
  query.set("per_page", String(PER_PAGE));
  query.set("page", String(page));
  if (search) query.set("search", search);
  if (category) query.set("category", category);
  if (sort) query.set("sort", sort);
  if (minPrice) query.set("min_price", minPrice);
  if (maxPrice) query.set("max_price", maxPrice);
  if (rating) query.set("rating", rating);

  const { data, loading, error, refetch } = useAsyncData<{
    products: Product[];
    total: number;
    lastPage: number;
  }>(
    () =>
      apiGet<PaginatedResponse<Product>>(`/products?${query.toString()}`).then(
        (r) => ({
          products: r.data,
          total: r.meta.total,
          lastPage: r.meta.last_page,
        }),
      ),
    [search, category, sort, minPrice, maxPrice, rating, page],
  );

  useEffect(() => {
    apiGet<{ data: Category[] }>("/categories")
      .then((r) => setCategories(r.data.filter((c) => c.parent_id === null)))
      .catch(() => setCategories([]));
  }, []);

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
          stagger: 0.04,
        },
      );
    }, el);
    return () => ctx.revert();
  }, [loading, data]);

  // Sync URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (category) params.set("category", category);
    if (sort) params.set("sort", sort);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (rating) params.set("rating", rating);
    const qs = params.toString();
    router.replace(qs ? `/products?${qs}` : "/products", { scroll: false });
  }, [search, category, sort, minPrice, maxPrice, rating, router]);

  function applyFilters() {
    setMinPrice(priceInputs.min);
    setMaxPrice(priceInputs.max);
    setPage(1);
  }

  function onSortChange(key: string) {
    setSort(key);
    setPage(1);
  }
  function onCategoryChange(key: string) {
    setCategory(key);
    setPage(1);
  }
  function onRatingChange(value: number) {
    setRating(rating === String(value) ? "" : String(value));
    setPage(1);
  }
  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
  }

  function removeFilter(type: string) {
    switch (type) {
      case "search": setSearch(""); break;
      case "category": setCategory(""); break;
      case "sort": setSort(""); break;
      case "min_price": setMinPrice(""); setPriceInputs((p) => ({ ...p, min: "" })); break;
      case "max_price": setMaxPrice(""); setPriceInputs((p) => ({ ...p, max: "" })); break;
      case "rating": setRating(""); break;
    }
    setPage(1);
  }

  function clearAll() {
    setSearch("");
    setCategory("");
    setSort("");
    setMinPrice("");
    setMaxPrice("");
    setRating("");
    setPriceInputs({ min: "", max: "" });
    setPage(1);
  }

  const activeFilters: { type: string; label: string }[] = [];
  if (search) activeFilters.push({ type: "search", label: `"${search}"` });
  if (category) {
    const cat = categories.find((c) => c.slug === category);
    activeFilters.push({ type: "category", label: cat?.name ?? category });
  }
  if (minPrice) activeFilters.push({ type: "min_price", label: `Min ${minPrice}` });
  if (maxPrice) activeFilters.push({ type: "max_price", label: `Max ${maxPrice}` });
  if (rating) activeFilters.push({ type: "rating", label: `Bintang ${rating}+` });

  const totalPages = data?.lastPage ?? 1;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-zinc-900">
          {search ? `Hasil untuk "${search}"` : "Katalog Produk"}
        </h1>
        <p className="text-sm text-zinc-500">
          {data ? `${data.total} produk ditemukan` : "Memuat produk..."}
        </p>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {activeFilters.map((f) => (
            <span
              key={f.type}
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-[#1c1c22] px-3 py-1 text-xs font-medium text-zinc-700"
            >
              {f.label}
              <button
                onClick={() => removeFilter(f.type)}
                className="text-zinc-400 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-3 w-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
          <button onClick={clearAll} className="text-xs text-zinc-400 hover:text-red-500">
            Hapus Semua
          </button>
        </div>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Search */}
          <form onSubmit={onSearchSubmit}>
            <label className="text-sm font-medium text-zinc-700">Cari</label>
            <div className="mt-1 flex">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Nama produk / SKU..."
                className="w-full rounded-l-full border border-zinc-300 px-4 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />
              <button
                type="submit"
                aria-label="Cari"
                className="rounded-r-full bg-white text-[#121212] px-4"
              >
                →
              </button>
            </div>
          </form>

          {/* Categories */}
          <div>
            <p className="text-sm font-medium text-zinc-700">Kategori</p>
            <div className="mt-2 space-y-1">
              <button
                onClick={() => onCategoryChange("")}
                className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                  category === "" ? "bg-white text-[#121212]" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                Semua
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => onCategoryChange(cat.slug)}
                  className={`block w-full rounded-lg px-3 py-1.5 text-left text-sm transition-colors ${
                    category === cat.slug ? "bg-white text-[#121212]" : "text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <p className="text-sm font-medium text-zinc-700">Rentang Harga</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={priceInputs.min}
                onChange={(e) => setPriceInputs((p) => ({ ...p, min: e.target.value }))}
                placeholder="Min"
                min="0"
                className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
              />
              <span className="text-xs text-zinc-400">—</span>
              <input
                type="number"
                value={priceInputs.max}
                onChange={(e) => setPriceInputs((p) => ({ ...p, max: e.target.value }))}
                placeholder="Max"
                min="0"
                className="w-full rounded-lg border border-zinc-300 px-3 py-1.5 text-xs focus:border-amber-500 focus:outline-none"
              />
            </div>
            <button
              onClick={applyFilters}
              className="mt-2 w-full rounded-lg bg-white text-[#121212] py-1.5 text-xs font-medium transition-opacity hover:opacity-90"
            >
              Terapkan
            </button>
          </div>

          {/* Rating Filter */}
          <div>
            <p className="text-sm font-medium text-zinc-700">Rating Minimum</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {RATING_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onRatingChange(opt.value)}
                  className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    rating === String(opt.value)
                      ? "border-amber-500 bg-amber-50 text-amber-700"
                      : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                  }`}
                >
                  <StarIcon />
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div>
          <div className="mb-4 flex items-center justify-end">
            <div className="inline-flex flex-wrap gap-1 rounded-full border border-zinc-200 bg-[#1c1c22] p-1">
              {SORTS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => onSortChange(s.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                    sort === s.key ? "bg-white text-[#121212]" : "text-zinc-500 hover:text-zinc-900"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
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

          {!loading && !error && data && data.products.length > 0 && (
            <div ref={gridRef} className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {data.products.map((product) => (
                <div key={product.id} data-card className="opacity-0">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          )}

          {!loading && !error && data && data.products.length === 0 && (
            <div className="rounded-2xl border border-dashed border-zinc-300 p-12 text-center text-zinc-500">
              Tidak ada produk yang cocok.
              <div className="mt-3">
                <button onClick={clearAll} className="text-sm text-amber-600 underline">
                  Reset filter
                </button>
              </div>
            </div>
          )}

          {!loading && !error && totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm disabled:opacity-40"
              >
                ←
              </button>
              <span className="px-2 text-sm text-zinc-600">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm disabled:opacity-40"
              >
                →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StarIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3 text-amber-400">
      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clipRule="evenodd" />
    </svg>
  );
}
