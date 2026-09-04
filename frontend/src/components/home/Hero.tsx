"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";

export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Background subtle scale-in
      gsap.fromTo(
        ".hero-image",
        { scale: 1.15, opacity: 0 },
        { scale: 1, opacity: 1, duration: 1.6, ease: "power2.out" },
      );

      // Split words entrance for the headline
      const words = Array.from(el.querySelectorAll<HTMLElement>(".hero-word"));
      gsap.fromTo(
        words,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.15,
        },
      );

      gsap.fromTo(
        ".hero-sub",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.6 },
      );
      gsap.fromTo(
        ".hero-cta",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", delay: 0.8 },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  const headline = ["Belanja", "Cerdas,", "Hidup", "Lebih", "Nyaman"];

  return (
    <section className="relative overflow-hidden bg-zinc-950 text-white">
      <div
        className="hero-image absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55)), url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/40" />

      <div
        ref={root}
        className="relative mx-auto flex min-h-[80vh] max-w-7xl flex-col items-start justify-center px-4 py-24 sm:px-6 lg:px-8"
      >
        <p className="hero-sub mb-4 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-medium tracking-widest text-amber-300">
          TOKO ONLINE TERPERCAYA
        </p>

        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
          {headline.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden align-bottom">
              <span className="hero-word inline-block px-1">
                {word}
              </span>
            </span>
          ))}
        </h1>

        <p className="hero-sub mt-6 max-w-xl text-base text-zinc-300 sm:text-lg">
          Temukan produk berkualitas dengan harga terbaik. Nikmati pengalaman
          belanja yang mudah, aman, dan menyenangkan di toko online kami.
        </p>

        <div className="hero-cta mt-10 flex flex-wrap gap-4">
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 text-sm font-semibold text-zinc-950 transition-transform duration-200 hover:scale-105 active:scale-95"
          >
            Belanja Sekarang
            <span className="transition-transform duration-200 group-hover:translate-x-1">
              →
            </span>
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center rounded-full border border-white/30 px-7 py-3.5 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/10"
          >
            Lihat Kategori
          </Link>
        </div>
      </div>
    </section>
  );
}
