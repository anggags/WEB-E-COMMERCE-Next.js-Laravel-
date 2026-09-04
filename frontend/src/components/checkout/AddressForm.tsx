"use client";

import { useState } from "react";
import { apiPost, apiPut, extractError, type ApiError } from "@/lib/api";
import type { Address } from "@/types";

interface AddressFormProps {
  initial?: Address | null;
  onSaved: (address: Address) => void;
  onCancel?: () => void;
}

export default function AddressForm({ initial, onSaved, onCancel }: AddressFormProps) {
  const [form, setForm] = useState({
    label: initial?.label ?? "",
    recipient_name: initial?.recipient_name ?? "",
    phone: initial?.phone ?? "",
    full_address: initial?.full_address ?? "",
    city: initial?.city ?? "",
    postal_code: initial?.postal_code ?? "",
    is_default: initial?.is_default ?? false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  function update<K extends keyof typeof form>(key: K, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = initial
        ? await apiPut<{ data: Address; message?: string }>(`/addresses/${initial.id}`, form)
        : await apiPost<{ data: Address; message?: string }>("/addresses", form);
      onSaved(res.data);
    } catch (err) {
      setError(extractError(err));
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none";

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-2xl border border-zinc-200 bg-white p-5">
      <h2 className="text-lg font-semibold text-zinc-900">
        {initial ? "Edit Alamat" : "Tambah Alamat Baru"}
      </h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-zinc-700">Label <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            placeholder="Rumah / Kantor"
            value={form.label}
            onChange={(e) => update("label", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700">Nama Penerima <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            value={form.recipient_name}
            onChange={(e) => update("recipient_name", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700">No. Telepon <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-zinc-700">Kota <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-zinc-700">Alamat Lengkap <span className="text-red-500">*</span></label>
        <textarea
          className={inputCls}
          rows={2}
          value={form.full_address}
          onChange={(e) => update("full_address", e.target.value)}
          required
        />
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <label className="text-sm font-medium text-zinc-700">Kode Pos <span className="text-red-500">*</span></label>
          <input
            className={inputCls}
            value={form.postal_code}
            onChange={(e) => update("postal_code", e.target.value)}
            required
          />
        </div>
        <label className="flex items-center gap-2 pb-2.5 text-sm text-zinc-600">
          <input
            type="checkbox"
            checked={form.is_default}
            onChange={(e) => update("is_default", e.target.checked)}
            className="h-4 w-4 accent-amber-500"
          />
          Jadikan alamat utama
        </label>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
          {error.errors &&
            Object.values(error.errors)
              .flat()
              .map((m, i) => <p key={i}>• {m}</p>)}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : initial ? "Simpan Perubahan" : "Simpan Alamat"}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-zinc-300 px-5 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-100"
          >
            Batal
          </button>
        )}
      </div>
    </form>
  );
}
