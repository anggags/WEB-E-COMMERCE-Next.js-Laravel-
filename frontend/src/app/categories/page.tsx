import type { Metadata } from "next";
import CategoriesClient from "@/components/catalog/CategoriesClient";

export const metadata: Metadata = {
  title: "Kategori",
};

export default function CategoriesPage() {
  return <CategoriesClient />;
}