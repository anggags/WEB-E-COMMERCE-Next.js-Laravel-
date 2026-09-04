"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { apiGet, extractError } from "@/lib/api";
import type { PaginatedResponse, Product, Review } from "@/types";
import { formatIDR } from "@/lib/format";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";

function Stars({ value }: { value: number }) {
  return (
    <span className="text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.round(value) ? "" : "opacity-25"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ProductDetailData({ product }: { product: Product }) {
  const router = useRouter();
  const { status } = useAuthStore();
  const { addItem } = useCartStore();

  const [activeImage, setActiveImage] = useState(0);
  const [variantId, setVariantId] = useState<number | null>(
    product.variants && product.variants.length > 0 ? product.variants[0].id : null,
  );
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addedError, setAddedError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const gallery = product.images ?? [];
  const activeSrc = gallery[activeImage]?.url;

  // Selected variant
  const selectedVariant = product.variants?.find((v) => v.id === variantId) ?? null;
  const variantPrice = selectedVariant
    ? Number(product.price) + Number(selectedVariant.extra_price || 0)
    : Number(product.price);

  // Effective stock: variant stock if variant selected, else product stock
  const effectiveStock = selectedVariant ? selectedVariant.stock : product.stock;
  const maxQty = Math.max(1, effectiveStock);

  // Reveal animations
  const detailsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = detailsRef.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-reveal]"),
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", stagger: 0.08 },
      );
    }, el);
    return () => ctx.revert();
  }, [product]);

  // Fetch reviews by product ID (endpoint uses ID, not slug)
  useEffect(() => {
    apiGet<PaginatedResponse<Review>>(`/products/${product.id}/reviews`)
      .then((r) => {
        setReviews(r.data);
        setReviewsError(null);
        setReviewsLoading(false);
      })
      .catch((e) => {
        setReviewsError(extractError(e).message);
        setReviewsLoading(false);
      });
  }, [product.id]);

  const total = useMemo(() => variantPrice * qty, [variantPrice, qty]);

  async function onAdd() {
    if (status !== "authenticated") {
      router.push("/login");
      return;
    }
    setAdding(true);
    setAddedError(null);
    try {
      await addItem(
        product.id,
        qty,
        selectedVariant ? selectedVariant.id : undefined,
      );
      setAdded(true);
      setTimeout(() => setAdded(false), 1500);
    } catch (e) {
      setAddedError(extractError(e).message);
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2">
        {/* Gallery */}
        <div data-reveal className="space-y-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-zinc-100">
            {activeSrc ? (
              <Image
                src={activeSrc}
                alt={product.name}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-zinc-300">
                No Image
              </div>
            )}
          </div>
          {gallery.length > 1 && (
            <div className="flex gap-2">
              {gallery.map((img, i) => (
                <button
                  key={img.id ?? i}
                  onClick={() => setActiveImage(i)}
                  className={`relative aspect-square w-20 overflow-hidden rounded-lg border-2 transition-colors ${
                    activeImage === i
                      ? "border-amber-500"
                      : "border-transparent hover:border-zinc-300"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={`${product.name} ${i + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div ref={detailsRef} className="space-y-5">
          {product.category && (
            <p data-reveal className="text-sm font-medium text-amber-600">
              {product.category.name}
            </p>
          )}
          <h1 data-reveal className="text-3xl font-bold text-zinc-900">
            {product.name}
          </h1>

          {Number(product.avg_rating) > 0 ? (
            <div data-reveal className="flex items-center gap-2 text-sm text-zinc-500">
              <Stars value={Number(product.avg_rating)} />
              <span>{Number(product.avg_rating).toFixed(1)}</span>
              <span>· {product.reviews_count ?? 0} ulasan</span>
            </div>
          ) : (
            <p data-reveal className="text-sm text-zinc-400">
              Belum ada ulasan
            </p>
          )}

          <p data-reveal className="text-3xl font-bold text-zinc-900">
            {formatIDR(variantPrice)}
          </p>
          {selectedVariant && Number(selectedVariant.extra_price) > 0 && (
            <p className="text-xs text-zinc-500">
              Termasuk tambahan varian {selectedVariant.name} (+
              {formatIDR(Number(selectedVariant.extra_price))})
            </p>
          )}

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div data-reveal>
              <p className="text-sm font-medium text-zinc-700">Pilih Varian</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVariantId(v.id)}
                    disabled={v.stock <= 0}
                    className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:opacity-40 ${
                      variantId === v.id
                        ? "border-zinc-900 bg-zinc-900 text-white"
                        : "border-zinc-300 hover:border-zinc-900"
                    }`}
                  >
                    {v.name}
                    {v.stock <= 0 && " (habis)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div data-reveal>
            <p className="text-sm font-medium text-zinc-700">Jumlah</p>
            <div className="mt-2 inline-flex items-center rounded-full border border-zinc-300">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                disabled={qty <= 1}
                className="px-4 py-2 text-lg disabled:opacity-30"
              >
                −
              </button>
              <span className="min-w-10 text-center text-sm font-semibold">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={qty >= maxQty}
                className="px-4 py-2 text-lg disabled:opacity-30"
              >
                +
              </button>
            </div>
            <p className="mt-2 text-xs text-zinc-500">
              Stok tersedia: {effectiveStock}
            </p>
          </div>

          {addedError && <p data-reveal className="text-sm text-red-500">{addedError}</p>}

          <div data-reveal className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={onAdd}
              disabled={adding || effectiveStock <= 0}
              className={`rounded-full px-8 py-3.5 text-sm font-medium text-white transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                added ? "bg-green-500" : "bg-zinc-900 hover:scale-105 active:scale-95"
              }`}
            >
              {adding
                ? "Menambahkan..."
                : added
                  ? "✓ Ditambahkan"
                  : effectiveStock <= 0
                    ? "Stok Habis"
                    : "Masukkan ke Keranjang"}
            </button>
            <p className="text-sm text-zinc-600">
              Subtotal: <span className="font-semibold">{formatIDR(total)}</span>
            </p>
          </div>

          <p data-reveal className="whitespace-pre-line border-t border-zinc-200 pt-5 text-zinc-600">
            {product.description}
          </p>
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-16">
        <h2 className="text-2xl font-bold text-zinc-900">Ulasan Pembeli</h2>
        <div className="mt-6 space-y-4">
          {reviewsLoading && (
            <div className="space-y-3">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-zinc-200 p-5">
                  <div className="h-3 w-1/3 rounded bg-zinc-200" />
                  <div className="mt-3 h-3 w-2/3 rounded bg-zinc-100" />
                </div>
              ))}
            </div>
          )}

          {!reviewsLoading && reviewsError && (
            <p className="text-sm text-red-500">{reviewsError}</p>
          )}

          {!reviewsLoading && !reviewsError && reviews.length === 0 && (
            <p className="text-zinc-500">Belum ada ulasan untuk produk ini.</p>
          )}

          {!reviewsLoading &&
            !reviewsError &&
            reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl border border-zinc-200 bg-white p-5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-zinc-200 text-sm font-semibold text-zinc-600">
                      {review.user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">
                        {review.user?.name}
                      </p>
                      <Stars value={review.rating} />
                    </div>
                  </div>
                  {review.created_at && (
                    <span className="text-xs text-zinc-400">
                      {new Date(review.created_at).toLocaleDateString("id-ID")}
                    </span>
                  )}
                </div>
                {review.comment && (
                  <p className="mt-3 text-sm text-zinc-600">{review.comment}</p>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
