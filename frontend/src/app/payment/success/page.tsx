"use client";

import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-8 w-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
      <h1 className="mt-6 text-2xl font-bold text-zinc-900">Pembayaran Berhasil</h1>
      <p className="mt-2 text-zinc-500">
        Terima kasih! Pembayaran Anda telah berhasil diproses.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="rounded-full bg-white text-[#121212] px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90"
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
