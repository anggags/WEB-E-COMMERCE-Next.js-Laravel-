"use client";

import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { ApiResponse, Category } from "@/types";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useReveal } from "@/hooks/useReveal";

export default function CategoriesClient() {
  const { data, loading, error, refetch } = useAsyncData<Category[]>(() =>
    apiGet<ApiResponse<Category[]>>("/categories").then((r) =>
      r.data.filter((c) => c.parent_id === null),
    ),
  );

  const ref = useReveal<HTMLDivElement>();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">Kategori</h1>
      <p className="mt-1 text-zinc-500">
        Temukan produk dari berbagai kategori pilihan kami.
      </p>

      <div ref={ref} className="mt-8">
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                data-reveal
                className="animate-pulse overflow-hidden rounded-2xl border border-zinc-200 bg-[#1c1c22]"
              >
                <div className="aspect-[4/5] bg-zinc-200" />
                <div className="space-y-2 p-4">
                  <div className="h-3 w-3/4 rounded bg-zinc-200" />
                  <div className="h-3 w-1/2 rounded bg-zinc-100" />
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

        {!loading && !error && data && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {data.map((cat) => (
              <Link
                key={cat.id}
                data-reveal
                href={`/categories/${cat.slug}`}
                className="rounded-2xl border border-zinc-200 bg-[#1c1c22] p-6 text-center transition-shadow hover:shadow-md"
              >
                <p className="text-base font-semibold text-zinc-800">{cat.name}</p>
                {cat.children && cat.children.length > 0 && (
                  <p className="mt-1 text-xs text-zinc-400">
                    {cat.children.length} subkategori
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}