import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-6xl font-bold text-zinc-200">404</p>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">Halaman tidak ditemukan</h1>
      <p className="mt-2 text-zinc-500">
        Halaman yang Anda cari tidak tersedia.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
      >
        Kembali ke Beranda
      </Link>
    </div>
  );
}
