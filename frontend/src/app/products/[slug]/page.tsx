import type { Metadata } from "next";
import ProductDetailData from "@/components/products/ProductDetailData";

export const metadata: Metadata = { title: "Detail Produk" };

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ProductDetailData slug={slug} />;
}