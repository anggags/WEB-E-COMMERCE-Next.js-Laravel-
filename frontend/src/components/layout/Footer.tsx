import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 bg-[#151518]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="font-display text-xl font-semibold uppercase tracking-[0.3em]">
            AVEST<span className="text-accent">A</span>
          </p>
          <p className="mt-2 max-w-xs text-sm text-zinc-500">
            Butik daring terkurasi untuk pengalaman belanja Anda sehari-hari.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">Navigasi</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li>
              <Link href="/products" className="transition-colors hover:text-white">
                Semua Produk
              </Link>
            </li>
            <li>
              <Link href="/categories" className="transition-colors hover:text-white">
                Kategori
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-zinc-100">Akun</p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-400">
            <li>
              <Link href="/login" className="transition-colors hover:text-white">
                Masuk
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition-colors hover:text-white">
                Daftar
              </Link>
            </li>
            <li>
              <Link href="/account" className="transition-colors hover:text-white">
                Akun Saya
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200 py-6 text-center text-xs text-zinc-500">
        &copy; {new Date().getFullYear()} AVESTA. Seluruh hak cipta.
      </div>
    </footer>
  );
}
