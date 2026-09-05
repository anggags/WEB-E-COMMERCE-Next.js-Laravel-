import type { Metadata } from "next";
import CategoryDetailClient from "@/components/catalog/CategoryDetailClient";

export const metadata: Metadata = { title: "Kategori" };

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <CategoryDetailClient slug={slug} />;
}