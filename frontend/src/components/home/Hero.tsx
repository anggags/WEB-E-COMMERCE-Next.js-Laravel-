"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

function SplitLine({ text, accent }: { text: string; accent?: boolean }) {
  const chars = Array.from(text);
  return (
    <span className="block overflow-hidden pb-[0.08em]">
      {chars.map((ch, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <span
            data-hero-char
            className={`inline-block ${accent ? "text-accent" : ""}`}
          >
            {ch === " " ? "\u00A0" : ch}
          </span>
        </span>
      ))}
    </span>
  );
}

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Slow scale-in of the backdrop
      gsap.fromTo(
        ".hero-image",
        { scale: 1.12, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.8, ease: "power2.out" },
      );

      // Char-by-char headline entrance
      gsap.fromTo(
        el.querySelectorAll("[data-hero-char]"),
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 1,
          ease: "power4.out",
          stagger: 0.028,
          delay: 0.15,
        },
      );

      gsap.fromTo(
        ".hero-eyebrow, .hero-sub, .hero-cta, .hero-meta",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12, delay: 0.7 },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} className="relative overflow-hidden bg-[#121212] text-white">
      {/* Backdrop */}
      <div
        className="hero-image absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(115deg, rgba(18,18,18,0.92) 20%, rgba(18,18,18,0.55) 60%, rgba(18,18,18,0.85) 100%), url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=2000&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-[#121212]/60" />
      <div className="hero-glow pointer-events-none absolute -right-32 top-1/3 h-[520px] w-[520px] rounded-full bg-accent/20 blur-[140px]" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col items-start justify-center px-4 pb-28 pt-20 sm:px-6 lg:px-8">
        <p className="hero-eyebrow text-xs font-extrabold uppercase tracking-[0.35em] text-white/60">
          Toko Online Terpercaya
        </p>

        <h1 className="mt-6 font-display text-[17vw] font-semibold uppercase leading-[0.95] tracking-[0.01em] sm:text-8xl lg:text-[9.5rem]">
          <SplitLine text="Belanja" />
          <SplitLine text="Cerdas," accent />
          <SplitLine text="Hidup" />
          <SplitLine text="Nyaman." />
        </h1>

        <p className="hero-sub mt-8 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
          Pilih produk berkualitas yang menemani setiap momenmu. Nikmati
          pengalaman berbelanja yang mudah, aman, dan sungguh menyenangkan di
          toko kami.
        </p>

        <div className="hero-cta mt-12 flex flex-wrap items-center gap-8">
          <Link
            href="/products"
            className="group inline-flex items-center gap-3 border-b border-white/40 pb-1 text-sm font-extrabold uppercase tracking-[0.2em] text-white transition-colors hover:border-accent hover:text-accent"
          >
            Belanja Sekarang
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
          <Link
            href="/categories"
            className="group inline-flex items-center gap-3 text-sm font-extrabold uppercase tracking-[0.2em] text-white/50 transition-colors hover:text-white"
          >
            Lihat Koleksi
            <span className="transition-transform duration-300 group-hover:translate-x-1.5">
              →
            </span>
          </Link>
        </div>

        <div className="hero-meta mt-20 flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
          <span>Kurir Cepat</span>
          <span className="h-1 w-1 rounded-full bg-accent" />
          <span>Pembayaran Aman</span>
          <span className="h-1 w-1 rounded-full bg-accent" />
          <span>Layanan 24/7</span>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex">
        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">
          Gulir
        </span>
        <span className="h-10 w-px bg-gradient-to-b from-white/50 to-transparent" />
      </div>
    </section>
  );
}