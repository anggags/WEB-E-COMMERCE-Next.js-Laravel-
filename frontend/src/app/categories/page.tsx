import Link from "next/link";
import { apiGet } from "@/lib/api";
import type { ApiResponse, Category } from "@/types";

export const metadata = {
  title: "Kategori",
};

export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const res = await apiGet<ApiResponse<Category[]>>("/categories");
  const root = res.data.filter((c) => c.parent_id === null);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">Kategori</h1>
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {root.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="rounded-2xl border border-zinc-200 bg-white p-6 text-center transition-shadow hover:shadow-md"
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
    </div>
  );
}
