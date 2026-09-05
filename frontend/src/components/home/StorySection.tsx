"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function StorySection() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        el.querySelectorAll("[data-story-line]"),
        { yPercent: 100 },
        {
          yPercent: 0,
          duration: 1.1,
          ease: "power4.out",
          stagger: 0.12,
          scrollTrigger: { trigger: el, start: "top 72%" },
        },
      );
      gsap.fromTo(
        ".story-copy, .story-kicker",
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: { trigger: el, start: "top 72%" },
        },
      );
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      className="relative overflow-hidden bg-[#121212] py-28 text-white sm:py-36"
    >
      <div className="hero-glow pointer-events-none absolute -left-40 top-0 h-[460px] w-[460px] rounded-full bg-accent/10 blur-[140px]" />

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="story-kicker text-[11px] font-extrabold uppercase tracking-[0.35em] text-accent">
          Tentang Toko
        </p>

        <div className="mt-8 font-display text-[13vw] font-medium uppercase leading-[0.95] sm:text-7xl lg:text-8xl">
          <p className="overflow-hidden">
            <span data-story-line className="block">
              Pilih <span className="italic text-accent">kenikmatan,</span>
            </span>
          </p>
          <p className="overflow-hidden">
            <span data-story-line className="block">
              bukan sekadar belanja.
            </span>
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-10 border-t border-white/10 pt-10 sm:flex-row sm:items-end sm:justify-between">
          <p className="story-copy max-w-md text-base leading-relaxed text-white/60">
            Setiap produk di rak kami dipilih dengan cermat: yang benar-benar
            berguna, jujur harganya, dan tahan lama. Sebuah toko yang hadir
            untuk mengingatkan bahwa hal kecil yang baik bisa membuat hari
            terasa lebih ringan.
          </p>
          <div className="story-copy flex items-center gap-8 text-[11px] font-bold uppercase tracking-[0.3em] text-white/40">
            <span>Kualitas</span>
            <span className="h-1 w-1 rounded-full bg-accent" />
            <span>Kejujuran</span>
            <span className="h-1 w-1 rounded-full bg-accent" />
            <span>Kenyamanan</span>
          </div>
        </div>
      </div>
    </section>
  );
}