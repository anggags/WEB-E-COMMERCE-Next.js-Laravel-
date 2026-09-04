"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiGet, apiPost, extractError } from "@/lib/api";
import { openSnapPayment } from "@/lib/midtrans";
import type { Address, ApiResponse, Order, Payment } from "@/types";
import { formatIDR } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import AddressForm from "@/components/checkout/AddressForm";

const PAYMENT_METHODS = [
  { key: "bank_transfer", label: "Transfer Bank" },
  { key: "va", label: "Virtual Account" },
  { key: "ewallet", label: "E-Wallet" },
  { key: "qris", label: "QRIS" },
  { key: "credit_card", label: "Kartu Kredit" },
];

interface SuccessInfo {
  order: Order;
  payment: Payment;
  invoice_no: string;
  total: number;
  snap_token?: string | null;
  client_key?: string | null;
}

export default function CheckoutClient() {
  const router = useRouter();
  const { status } = useAuthStore();
  const { cart, fetchCart, status: cartStatus } = useCartStore();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<number | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrsLoading, setAddrsLoading] = useState(true);
  const [addrsError, setAddrsError] = useState<string | null>(null);

  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHODS[0].key);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState<SuccessInfo | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  const items = cart?.items ?? [];
  const empty = !cart || items.length === 0;

  useEffect(() => {
    if (status !== "authenticated") return;
    apiGet<ApiResponse<Address[]>>("/addresses")
      .then((r) => {
        setAddresses(r.data);
        const def = r.data.find((a) => a.is_default);
        if (def) setSelectedAddress((cur) => cur ?? def.id);
        else if (r.data.length > 0) setSelectedAddress((cur) => cur ?? r.data[0].id);
        setAddrsError(null);
      })
      .catch((e) => setAddrsError(extractError(e).message))
      .finally(() => setAddrsLoading(false));

    if (cartStatus === "idle") fetchCart();
  }, [status, cartStatus, fetchCart]);

  function onAddressSaved(saved: Address) {
    setAddresses((prev) => [...prev, saved]);
    setSelectedAddress(saved.id);
    setShowAddressForm(false);
  }

  async function handleCheckout() {
    if (!selectedAddress) {
      setSubmitError("Silakan pilih alamat pengiriman.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiPost<
        ApiResponse<Order> & { payment: Payment; snap_token?: string; client_key?: string }
      >("/checkout", {
        address_id: selectedAddress,
        payment_method: paymentMethod,
      });
      setSuccess({
        order: res.data,
        payment: res.payment,
        invoice_no: res.data.invoice_no,
        total: res.data.total,
        snap_token: res.snap_token,
        client_key: res.client_key,
      });
      await fetchCart();
    } catch (e) {
      setSubmitError(extractError(e).message);
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return <SuccessScreen success={success} />;
  }

  if (status !== "authenticated" || empty) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-zinc-900">Keranjang Kosong</h1>
        <p className="mt-2 text-zinc-500">
          Tambahkan produk terlebih dahulu sebelum checkout.
        </p>
        <button
          onClick={() => router.push("/products")}
          className="mt-6 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white"
        >
          Lihat Produk
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-zinc-900">Checkout</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-lg font-semibold text-zinc-900">1. Alamat Pengiriman</h2>

            {addrsError && <p className="mt-2 text-sm text-red-500">{addrsError}</p>}

            {!showAddressForm && (
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {addresses.map((addr) => (
                  <button
                    key={addr.id}
                    onClick={() => setSelectedAddress(addr.id)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      selectedAddress === addr.id
                        ? "border-amber-500 bg-amber-50"
                        : "border-zinc-200 hover:border-zinc-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-zinc-900">{addr.label || "Alamat"}</span>
                      {addr.is_default && (
                        <span className="rounded-full bg-zinc-200 px-2 py-0.5 text-[10px] font-medium text-zinc-600">Utama</span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-zinc-600">{addr.recipient_name} · {addr.phone}</p>
                    <p className="mt-1 text-xs text-zinc-500">{addr.full_address}, {addr.city} {addr.postal_code}</p>
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowAddressForm((v) => !v)}
              className="mt-3 text-sm font-medium text-amber-600 hover:underline"
            >
              {showAddressForm ? "Batal" : "+ Tambah alamat baru"}
            </button>

            {showAddressForm && (
              <div className="mt-3">
                <AddressForm onSaved={onAddressSaved} onCancel={() => setShowAddressForm(false)} />
              </div>
            )}

            {!addrsLoading && addresses.length === 0 && !showAddressForm && (
              <p className="mt-3 text-sm text-zinc-500">Belum ada alamat. Silakan tambahkan alamat baru.</p>
            )}
          </section>

          <section>
            <h2 className="text-lg font-semibold text-zinc-900">2. Metode Pembayaran</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.key}
                  onClick={() => setPaymentMethod(m.key)}
                  className={`rounded-2xl border p-4 text-left transition-colors ${
                    paymentMethod === m.key
                      ? "border-amber-500 bg-amber-50"
                      : "border-zinc-200 hover:border-zinc-300"
                  }`}
                >
                  <span className="text-sm font-medium text-zinc-900">{m.label}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-zinc-200 bg-white p-6 lg:sticky lg:top-24">
          <h2 className="text-lg font-semibold text-zinc-900">Ringkasan Pesanan</h2>

          <ul className="mt-4 max-h-64 space-y-3 overflow-y-auto pr-1">
            {items.map((item) => {
              const name = item.product?.name ?? `Produk #${item.id}`;
              const image = item.product?.images?.[0]?.url;
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                    {image ? <Image src={image} alt={name} fill sizes="48px" className="object-cover" /> : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm text-zinc-800">{name}</p>
                    <p className="text-xs text-zinc-500">× {item.qty}</p>
                  </div>
                  <p className="text-sm font-medium text-zinc-900">{formatIDR(item.subtotal)}</p>
                </li>
              );
            })}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4">
            <span className="text-zinc-600">Total</span>
            <span className="text-2xl font-bold text-zinc-900">{formatIDR(cart?.total ?? 0)}</span>
          </div>

          {submitError && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-600">{submitError}</p>}

          <button
            onClick={handleCheckout}
            disabled={submitting}
            className="mt-5 w-full rounded-full bg-zinc-900 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {submitting ? "Memproses..." : "Buat Pesanan"}
          </button>
        </aside>
      </div>
    </div>
  );
}

function SuccessScreen({ success }: { success: SuccessInfo }) {
  const router = useRouter();
  const [paying, setPaying] = useState(false);
  const [paymentResult, setPaymentResult] = useState<"success" | "pending" | null>(null);

  async function handlePay() {
    const token = success.snap_token;
    const clientKey = success.client_key;
    if (!token || !clientKey) {
      router.push(`/account?tab=orders`);
      return;
    }
    setPaying(true);
    try {
      await openSnapPayment(token, clientKey, {
        onSuccess: () => setPaymentResult("success"),
        onPending: () => setPaymentResult("pending"),
        onClose: () => setPaying(false),
        onError: () => setPaying(false),
      });
    } catch {
      setPaying(false);
    }
  }

  if (paymentResult === "success") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckIcon />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Pembayaran Berhasil!</h1>
        <p className="mt-2 text-zinc-500">Terima kasih, pembayaran Anda telah diterima.</p>
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-left">
          <InfoRow label="No. Invoice" value={success.invoice_no} mono />
          <InfoRow label="Status" value="Dibayar" color="text-green-600" />
          <InfoRow label="Total" value={formatIDR(success.total)} bold />
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => router.push("/")} className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white">Kembali ke Beranda</button>
          <button onClick={() => router.push("/account?tab=orders")} className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100">Lihat Pesanan</button>
        </div>
      </div>
    );
  }

  if (paymentResult === "pending") {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <ClockIcon />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-zinc-900">Menunggu Pembayaran</h1>
        <p className="mt-2 text-zinc-500">Silakan selesaikan pembayaran sesuai instruksi yang diberikan.</p>
        <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-left">
          <InfoRow label="No. Invoice" value={success.invoice_no} mono />
          <InfoRow label="Status" value="Menunggu Pembayaran" color="text-amber-600" />
          <InfoRow label="Total" value={formatIDR(success.total)} bold />
        </div>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button onClick={() => router.push("/")} className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white">Kembali ke Beranda</button>
          <button onClick={() => router.push("/account?tab=orders")} className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100">Lihat Pesanan</button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
        <CheckIcon />
      </div>
      <h1 className="mt-6 text-2xl font-bold text-zinc-900">Pesanan Berhasil Dibuat!</h1>
      <p className="mt-2 text-zinc-500">Terima kasih, pesanan Anda telah kami terima.</p>

      <div className="mt-8 rounded-2xl border border-zinc-200 bg-white p-6 text-left">
        <InfoRow label="No. Invoice" value={success.invoice_no} mono />
        <InfoRow label="Status" value="Pending" color="text-amber-600" />
        <InfoRow
          label="Pembayaran"
          value={PAYMENT_METHODS.find((m) => m.key === success.payment.method)?.label ?? success.payment.method ?? ""}
        />
        <InfoRow label="Total" value={formatIDR(success.total)} bold />
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          onClick={handlePay}
          disabled={paying}
          className="rounded-full bg-amber-500 px-8 py-3.5 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {paying ? "Memproses Pembayaran..." : "Bayar Sekarang"}
        </button>
        <button
          onClick={() => router.push("/account?tab=orders")}
          className="rounded-full border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Bayar Nanti
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono, bold, color }: { label: string; value: string; mono?: boolean; bold?: boolean; color?: string }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-zinc-500">{label}</span>
      <span className={`${mono ? "font-mono" : ""} ${bold ? "font-bold" : "font-medium"} ${color ?? "text-zinc-900"} text-sm`}>{value}</span>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-8 w-8">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  );
}
