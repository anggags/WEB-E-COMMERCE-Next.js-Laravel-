import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import type { ApiResponse, Category } from "@/types";
import CategoryDetailClient from "@/components/catalog/CategoryDetailClient";

export const dynamic = "force-dynamic";

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const res = await apiGet<ApiResponse<Category>>(`/categories/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cat = await getCategory(slug);
  return { title: cat?.name ?? "Kategori" };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();

  return <CategoryDetailClient slug={slug} initialCategory={category} />;
}
