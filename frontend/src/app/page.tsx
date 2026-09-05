export const metadata = {
  title: "Beranda",
};

import Hero from "@/components/home/Hero";
import StorySection from "@/components/home/StorySection";
import CategorySection from "@/components/home/CategorySection";
import ProductSection from "@/components/home/ProductSection";

export default function HomePage() {
  return (
    <div className="bg-[#121212]">
      <Hero />
      <StorySection />
      <CategorySection />
      <ProductSection />
    </div>
  );
}