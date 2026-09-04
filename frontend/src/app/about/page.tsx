import Link from "next/link";

export const metadata = {
  title: "Tentang",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-zinc-900">Tentang Kami</h1>
      <p className="mt-6 text-zinc-600">
        Toko Online adalah platform e-commerce yang menyediakan berbagai produk
        berkualitas dengan harga terbaik. Kami berkomitmen memberikan pengalaman
        belanja yang mudah, aman, dan menyenangkan bagi seluruh pelanggan.
      </p>
      <Link
        href="/products"
        className="mt-8 inline-block rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Mulai Belanja
      </Link>
    </div>
  );
}
