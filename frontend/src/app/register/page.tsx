"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { extractError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(name, email, password);
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(extractError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900">Daftar</h1>
      <p className="mt-2 text-sm text-zinc-500">
        Buat akun untuk mulai berbelanja.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700">Nama</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
          <p className="mt-1 text-xs text-zinc-400">Minimal 8 karakter.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">
            Konfirmasi Password
          </label>
          <input
            type="password"
            required
            minLength={8}
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-white text-[#121212] px-6 py-3 text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Memproses..." : "Daftar"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-zinc-500">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-amber-600 hover:underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
