"use client";

import { useEffect, useState } from "react";
import { apiGet, apiDelete, extractError } from "@/lib/api";
import type { Address, ApiResponse } from "@/types";
import AddressForm from "@/components/checkout/AddressForm";

export default function AddressSection() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    apiGet<ApiResponse<Address[]>>("/addresses")
      .then((res) => {
        if (!active) return;
        setAddresses(res.data);
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(extractError(e).message);
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function reloadAddresses() {
    try {
      const res = await apiGet<ApiResponse<Address[]>>("/addresses");
      setAddresses(res.data);
    } catch (e) {
      setError(extractError(e).message);
    }
  }

  async function handleSaved() {
    setShowForm(false);
    setEditing(null);
    await reloadAddresses();
  }

  async function handleDelete(addr: Address) {
    if (!confirm(`Hapus alamat "${addr.label ?? addr.full_address}"?`)) return;
    setDeleting(addr.id);
    try {
      await apiDelete(`/addresses/${addr.id}`);
      setAddresses((prev) => prev.filter((a) => a.id !== addr.id));
    } catch (e) {
      alert(extractError(e).message);
    } finally {
      setDeleting(null);
    }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => (
      <div key={i} className="h-28 animate-pulse rounded-2xl bg-zinc-100" />
    ))}</div>;
  }

  if (showForm || editing) {
    return (
      <div className="mx-auto max-w-lg">
        <button
          onClick={() => { setShowForm(false); setEditing(null); }}
          className="mb-4 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
          Kembali
        </button>
        <AddressForm
          initial={editing}
          onSaved={handleSaved}
          onCancel={() => { setShowForm(false); setEditing(null); }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">Daftar Alamat</h2>
        <button
          onClick={() => setShowForm(true)}
          className="rounded-full bg-white text-[#121212] px-4 py-2 text-sm font-medium transition-opacity hover:opacity-90"
        >
          + Tambah Baru
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {addresses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-zinc-300 py-10 text-center text-sm text-zinc-400">
          Belum ada alamat tersimpan.
        </div>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className="rounded-2xl border border-zinc-200 bg-[#1c1c22] p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-zinc-900">{addr.label}</span>
                {addr.is_default && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Utama</span>
                )}
              </div>
              <p className="mt-1 text-sm text-zinc-600">{addr.recipient_name} &middot; {addr.phone}</p>
              <p className="text-sm text-zinc-500">
                {addr.full_address}, {addr.city} {addr.postal_code}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={() => setEditing(addr)}
                className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(addr)}
                disabled={deleting === addr.id}
                className="rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
              >
                {deleting === addr.id ? "..." : "Hapus"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
