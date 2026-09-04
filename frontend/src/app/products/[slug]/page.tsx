import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apiGet } from "@/lib/api";
import type { ApiResponse, Product } from "@/types";
import ProductDetailData from "@/components/products/ProductDetailData";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await apiGet<ApiResponse<Product>>(`/products/${slug}`);
    return { title: res.data.name };
  } catch {
    return { title: "Detail Produk" };
  }
}

async function getProduct(slug: string): Promise<Product | null> {
  try {
    const res = await apiGet<ApiResponse<Product>>(`/products/${slug}`);
    return res.data;
  } catch {
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  return <ProductDetailData product={product} />;
}
