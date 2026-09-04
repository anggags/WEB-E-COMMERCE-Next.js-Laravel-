import { Suspense } from "react";
import type { Metadata } from "next";
import CatalogClient from "@/components/catalog/CatalogClient";

export const metadata: Metadata = {
  title: "Katalog Produk",
};

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-10 text-zinc-500">
          Memuat katalog...
        </div>
      }
    >
      <CatalogClient />
    </Suspense>
  );
}
