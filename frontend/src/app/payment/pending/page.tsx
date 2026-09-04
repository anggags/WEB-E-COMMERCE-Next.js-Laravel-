"use client";

import Link from "next/link";

export default function PaymentPendingPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-zinc-900">Menunggu Pembayaran</h1>
      <p className="mt-2 text-zinc-500">
        Silakan selesaikan pembayaran sesuai instruksi yang diberikan. Pembayaran akan diverifikasi secara otomatis.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/account?tab=orders"
          className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Lihat Pesanan
        </Link>
      </div>
    </div>
  );
}
