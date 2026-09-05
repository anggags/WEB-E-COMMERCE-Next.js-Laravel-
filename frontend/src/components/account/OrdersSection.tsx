"use client";

import { useEffect, useState } from "react";
import { formatIDR } from "@/lib/format";
import { apiGet, apiPost, extractError } from "@/lib/api";
import { openSnapPayment } from "@/lib/midtrans";
import type { ApiResponse, Order, PaginatedResponse } from "@/types";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-accent/15 text-accent",
  paid: "bg-sky-500/15 text-sky-300",
  processing: "bg-indigo-500/15 text-indigo-300",
  shipped: "bg-purple-500/15 text-purple-300",
  completed: "bg-green-500/15 text-green-400",
  cancelled: "bg-zinc-200 text-zinc-500",
};

export default function OrdersSection() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [payingFor, setPayingFor] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    apiGet<PaginatedResponse<Order>>("/orders", { params: { page } })
      .then((res) => {
        if (!active) return;
        setOrders(res.data);
        setLastPage(res.meta.last_page);
        setLoading(false);
      })
      .catch((e) => {
        if (!active) return;
        setError(extractError(e).message);
        setLoading(false);
      });
    return () => { active = false; };
  }, [page]);

  async function cancelOrder(order: Order) {
    if (!confirm("Batalkan pesanan ini?")) return;
    setCancelling(order.id);
    try {
      const res = await apiPost<ApiResponse<Order>>(`/orders/${order.id}/cancel`);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? res.data : o)));
      setExpanded(null);
    } catch (e) {
      alert(extractError(e).message);
    } finally {
      setCancelling(null);
    }
  }

  async function handlePay(order: Order) {
    setPayingFor(order.id);
    try {
      const res = await apiGet<{ success: boolean; snap_token: string; client_key: string }>(`/orders/${order.id}/pay`);
      if (!res.snap_token || !res.client_key) {
        alert("Token pembayaran tidak tersedia.");
        setPayingFor(null);
        return;
      }
      await openSnapPayment(res.snap_token, res.client_key, {
        onSuccess: () => {
          setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: "paid" } : o)));
          setPayingFor(null);
          setExpanded(null);
        },
        onPending: () => setPayingFor(null),
        onClose: () => setPayingFor(null),
        onError: () => setPayingFor(null),
      });
    } catch (e) {
      alert(extractError(e).message);
      setPayingFor(null);
    }
  }

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => (
      <div key={i} className="h-24 animate-pulse rounded-2xl bg-zinc-100" />
    ))}</div>;
  }

  if (error) return <p className="text-sm text-red-500">{error}</p>;

  if (orders.length === 0) {
    return (
      <div className="py-12 text-center text-zinc-500">
        <p>Belum ada pesanan.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => {
        const isOpen = expanded === order.id;
        const canCancel = ["pending", "paid"].includes(order.status);
        return (
          <div key={order.id} className="overflow-hidden rounded-2xl border border-zinc-200 bg-[#1c1c22]">
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-zinc-900 truncate">{order.invoice_no}</p>
                <p className="text-xs text-zinc-400">{order.created_at ? new Date(order.created_at).toLocaleDateString("id-ID") : "-"}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[order.status] ?? "bg-zinc-100 text-zinc-600"}`}>
                  {order.status}
                </span>
                <span className="text-sm font-semibold text-zinc-900">{formatIDR(order.total)}</span>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-zinc-100 px-5 pb-5 pt-4 space-y-4">
                {/* Items */}
                <div>
                  <h4 className="text-xs font-semibold uppercase text-zinc-400">Item</h4>
                  <ul className="mt-2 divide-y divide-zinc-100">
                    {(order.items ?? []).map((item) => (
                      <li key={item.id} className="flex justify-between py-2 text-sm">
                        <span className="text-zinc-700">{item.product?.name ?? `#${item.product?.id}`} × {item.qty}</span>
                        <span className="font-medium text-zinc-900">{formatIDR(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Address */}
                {order.address && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-zinc-400">Alamat Pengiriman</h4>
                    <p className="mt-1 text-sm text-zinc-700">
                      {order.address.recipient_name} &middot; {order.address.phone}
                    </p>
                    <p className="text-sm text-zinc-500">
                      {order.address.full_address}, {order.address.city} {order.address.postal_code}
                    </p>
                  </div>
                )}

                {/* Payment */}
                {order.payment && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase text-zinc-400">Pembayaran</h4>
                    <p className="mt-1 text-sm text-zinc-700">
                      {order.payment.method} &middot; {order.payment.status}
                    </p>
                    {order.payment.paid_at && (
                      <p className="text-xs text-zinc-400">Dibayar: {new Date(order.payment.paid_at).toLocaleDateString("id-ID")}</p>
                    )}
                  </div>
                )}

                {canCancel && (
                  <div className="flex gap-2">
                    {order.payment?.status !== "paid" && (
                      <button
                        onClick={() => handlePay(order)}
                        disabled={payingFor === order.id}
                        className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-zinc-900 transition-opacity hover:opacity-90 disabled:opacity-50"
                      >
                        {payingFor === order.id ? "Memproses..." : "Bayar Sekarang"}
                      </button>
                    )}
                    <button
                      onClick={() => cancelOrder(order)}
                      disabled={cancelling === order.id}
                      className="rounded-full border border-red-300 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                    >
                      {cancelling === order.id ? "Membatalkan..." : "Batalkan Pesanan"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Pagination */}
      {lastPage > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
          >
            Sebelumnya
          </button>
          <span className="text-sm text-zinc-500">{page} / {lastPage}</span>
          <button
            onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
            disabled={page >= lastPage}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-sm text-zinc-600 hover:bg-zinc-100 disabled:opacity-30"
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
}
