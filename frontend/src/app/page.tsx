export const metadata = {
  title: "Beranda",
};

import Hero from "@/components/home/Hero";
import CategorySection from "@/components/home/CategorySection";
import ProductSection from "@/components/home/ProductSection";

export default function HomePage() {
  return (
    <div>
      <Hero />
      <CategorySection />
      <ProductSection />
    </div>
  );
}
