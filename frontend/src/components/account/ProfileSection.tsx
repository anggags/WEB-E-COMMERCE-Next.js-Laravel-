"use client";

import { useState } from "react";
import type { User } from "@/types";
import { apiPut, extractError } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import type { ApiResponse } from "@/types";

export default function ProfileSection({ user }: { user: User }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (password && password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }
    setLoading(true);
    try {
      const body: Record<string, string> = { name };
      if (password) {
        body.password = password;
        body.password_confirmation = passwordConfirmation;
      }
      const res = await apiPut<ApiResponse<User>>("/me", body);
      setUser(res.data);
      setSuccess("Profil berhasil diperbarui.");
      setPassword("");
      setPasswordConfirmation("");
    } catch (e) {
      setError(extractError(e).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="rounded-2xl border border-zinc-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-zinc-900">Informasi Akun</h2>
        <p className="mt-1 text-sm text-zinc-500">{user.email}</p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
            <label className="block text-sm font-medium text-zinc-700">
              Password Baru <span className="text-zinc-400">(opsional)</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
            />
          </div>
          {password && (
            <div>
              <label className="block text-sm font-medium text-zinc-700">
                Konfirmasi Password
              </label>
              <input
                type="password"
                required
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 px-4 py-2.5 text-sm focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}
          {success && <p className="text-sm text-green-600">{success}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-zinc-900 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </form>
      </div>
    </div>
  );
}
