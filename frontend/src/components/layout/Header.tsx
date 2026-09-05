"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { useUIStore } from "@/store/uiStore";
import { apiGet } from "@/lib/api";
import type { PaginatedResponse, Product } from "@/types";
import { formatIDR } from "@/lib/format";
import {
  addRecentSearch,
  clearRecentSearches,
  getRecentSearches,
  type SearchSuggestion,
} from "@/lib/search";

gsap.registerPlugin(ScrollTrigger);

export default function Header() {
  const headerRef = useRef<HTMLElement>(null);
  const { user, status, logout } = useAuthStore();
  const { cart } = useCartStore();
  const { openCart } = useUIStore();
  const router = useRouter();

  const cartCount = cart?.qty ?? 0;

  // Search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // GSAP shrink on scroll
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const scroller = document.body;
      const box = el.querySelector("[data-nav-box]") as HTMLElement | null;
      const navHeight = box?.offsetHeight ?? 64;

      gsap.to(el, {
        ease: "none",
        scrollTrigger: {
          trigger: scroller,
          start: "top top",
          end: "max",
          scrub: true,
          onUpdate: (self) => {
            const shrink = self.progress > 0.08;
            if (box) {
              gsap.to(box, {
                height: shrink ? navHeight * 0.72 : navHeight,
                duration: 0.2,
                ease: "power2.out",
                overwrite: "auto",
              });
            }
            el.classList.toggle("header-shrunk", shrink);
          },
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced autocomplete
  const fetchSuggestions = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!q.trim()) {
      setSuggestions([]);
      setLoadingSuggestions(false);
      return;
    }
    setLoadingSuggestions(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiGet<PaginatedResponse<Product>>("/products", {
          params: { search: q, per_page: 5 },
        });
        setSuggestions(
          res.data.map((p) => ({
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            image: p.images?.[0]?.url,
          })),
        );
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);
  }, []);

  function openSearch() {
    setSearchOpen(true);
    setRecentSearches(getRecentSearches());
    setTimeout(() => inputRef.current?.focus(), 50);
  }

  function submitSearch(q: string) {
    const trimmed = q.trim();
    if (!trimmed) return;
    addRecentSearch(trimmed);
    setShowDropdown(false);
    setSearchOpen(false);
    setQuery("");
    setSuggestions([]);
    router.push(`/products?q=${encodeURIComponent(trimmed)}`);
  }

  async function handleLogout() {
    await logout();
  }

  return (
<header
      ref={headerRef}
      className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-[#151518]/85 backdrop-blur-md transition-all duration-300"
    >
      <div
        data-nav-box
        className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8"
      >
        <Link href="/" className="text-lg font-bold tracking-tight">
          Toko<span className="text-accent">Online</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-300 md:flex">
          <Link href="/" className="transition-colors hover:text-white">
            Beranda
          </Link>
          <Link href="/products" className="transition-colors hover:text-white">
            Produk
          </Link>
          <Link href="/categories" className="transition-colors hover:text-white">
            Kategori
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div ref={searchRef} className="relative">
            {searchOpen ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submitSearch(query);
                }}
                className="flex items-center"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    fetchSuggestions(e.target.value);
                    setShowDropdown(true);
                  }}
                  onFocus={() => {
                    setRecentSearches(getRecentSearches());
                    setShowDropdown(true);
                  }}
                  placeholder="Cari produk..."
                  className="w-48 rounded-full border border-zinc-300 bg-[#1c1c22] px-4 py-1.5 pr-8 text-sm text-zinc-100 placeholder:text-zinc-500 focus:w-64 focus:border-accent focus:outline-none transition-all sm:w-56 sm:focus:w-72"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                    setSuggestions([]);
                    setShowDropdown(false);
                  }}
                  className="absolute right-2 p-1 text-zinc-400 hover:text-zinc-200"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            ) : (
              <button
                onClick={openSearch}
                aria-label="Cari produk"
                className="rounded-full p-2 text-zinc-300 transition-colors hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-5 w-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                </svg>
              </button>
            )}

            {/* Dropdown: recent + suggestions */}
            {searchOpen && showDropdown && (
              <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-zinc-200 bg-[#1c1c22] shadow-xl">
                {/* Recent searches */}
                {recentSearches.length > 0 && !query && (
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-zinc-400">Pencarian Terakhir</span>
                      <button
                        onClick={() => {
                          clearRecentSearches();
                          setRecentSearches([]);
                        }}
                        className="text-xs text-zinc-400 hover:text-red-500"
                      >
                        Hapus
                      </button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {recentSearches.map((s) => (
                        <button
                          key={s}
                          onClick={() => submitSearch(s)}
                          className="rounded-full border border-zinc-200 px-3 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-100"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Autocomplete suggestions */}
                {query && (
                  <div className="p-2">
                    {loadingSuggestions && (
                      <div className="px-3 py-4 text-center text-xs text-zinc-400">Mencari...</div>
                    )}
                    {!loadingSuggestions && suggestions.length === 0 && (
                      <div className="px-3 py-4 text-center text-xs text-zinc-400">
                        Tidak ada hasil untuk &quot;{query}&quot;
                      </div>
                    )}
                    {!loadingSuggestions && suggestions.length > 0 && (
                      <ul>
                        {suggestions.map((s) => (
                          <li key={s.id}>
                            <button
                              onClick={() => submitSearch(s.name)}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-zinc-50"
                            >
                              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-100">
                                {s.image ? (
                                  <Image src={s.image} alt="" width={40} height={40} className="h-full w-full object-cover" />
                                ) : null}
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-zinc-800">{s.name}</p>
                                <p className="text-xs font-semibold text-amber-600">{formatIDR(s.price)}</p>
                              </div>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                    {!loadingSuggestions && suggestions.length > 0 && (
                      <button
                        onClick={() => submitSearch(query)}
                        className="mt-1 w-full rounded-xl bg-zinc-50 py-2 text-center text-xs font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                      >
                        Lihat semua hasil untuk &quot;{query}&quot;
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cart */}
          <button
            onClick={openCart}
            aria-label="Buka keranjang"
            className="relative rounded-full p-2 text-zinc-600 transition-colors hover:text-zinc-900"
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </button>

          {status === "authenticated" && user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="hidden text-sm font-medium text-zinc-300 transition-colors hover:text-white sm:block"
              >
                {user.name}
              </Link>
              <button
                onClick={handleLogout}
                className="rounded-full bg-white text-[#121212] px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
              >
                Keluar
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-white text-[#121212] px-4 py-1.5 text-sm font-medium transition-opacity hover:opacity-90"
            >
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="h-6 w-6">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007Z" />
    </svg>
  );
}
