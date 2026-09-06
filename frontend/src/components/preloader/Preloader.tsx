"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

const OK_FLAG = "avesta.preloaded";

/**
 * Split-panel AVESTA preloader:
 *  - One row: left "A" — small flat photo — right "A", with real gaps
 *    (letters never overlap the photo).
 *  - Enter: the two letters blur-in one by one (0.3s apart), photo follows.
 *  - A quick crossfade of 8 photos cycles across the whole duration.
 *  - Total duration ~2.5s, then both letters slide to the screen edges
 *    simultaneously, stop, and the preloader disappears — revealing the page.
 *
 * Scroll (Lenis) is locked while present. Runs once per session
 * (sessionStorage); skipped for prefers-reduced-motion.
 */
export const PRELOADER_IMAGES = [
  "/images/preloader/1.jpg",
  "/images/preloader/2.jpg",
  "/images/preloader/3.jpg",
  "/images/preloader/4.jpg",
  "/images/preloader/5.jpg",
  "/images/preloader/6.jpg",
  "/images/preloader/7.jpg",
  "/images/preloader/8.jpg",
] as const;

const TOTAL_DURATION = 2.5; // seconds for the whole preloader

export default function Preloader() {
  const rootRef = useRef<HTMLDivElement>(null);
  const leftARef = useRef<HTMLSpanElement>(null);
  const rightARef = useRef<HTMLSpanElement>(null);
  const photoWrapRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const [canShow] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return !(
      sessionStorage.getItem(OK_FLAG) === "1" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  });

  useEffect(() => {
    if (!canShow) return;
    const root = rootRef.current;
    const leftA = leftARef.current;
    const rightA = rightARef.current;
    const photoWrap = photoWrapRef.current;
    if (!root || !leftA || !rightA || !photoWrap) return;

    // Lock scroll / Lenis while the preloader is up.
    document.body.style.overflow = "hidden";
    document.documentElement.classList.add("avesta-loading");

    const ctx = gsap.context(() => {
      // --- Enter: letters blur-in one by one (0.3s apart), photo alongside ---
      gsap.fromTo(
        leftA,
        { opacity: 0, filter: "blur(16px)" },
        { opacity: 1, filter: "blur(0px)", duration: 0.6, delay: 0, ease: "power3.out" },
      );
      gsap.fromTo(
        rightA,
        { opacity: 0, filter: "blur(16px)" },
        { opacity: 1, filter: "blur(0px)", duration: 0.6, delay: 0.3, ease: "power3.out" },
      );
      gsap.fromTo(
        photoWrap,
        { opacity: 0, filter: "blur(12px)" },
        { opacity: 1, filter: "blur(0px)", duration: 0.6, delay: 0.3, ease: "power3.out" },
      );

      // --- Photo crossfade loop: 8 photos across the total duration ---
      const imgs = Array.from(root.querySelectorAll<HTMLImageElement>(".avesta-photo"));
      const n = imgs.length;
      const per = TOTAL_DURATION / n;
      const fade = 0.18;
      const hold = per - fade;
      const cross = gsap.timeline({ repeat: -1, defaults: { ease: "power2.inOut" } });
      cross.set(imgs[0], { opacity: 1 });
      for (let i = 0; i < n; i++) {
        const t = i * per;
        cross
          .to(imgs[i], { opacity: 0, duration: fade }, t + hold)
          .to(imgs[(i + 1) % n], { opacity: 1, duration: fade }, t + hold);
      }
      cross.totalDuration(per * n);

      // --- Progress bar across the total duration ---
      gsap.fromTo(
        barRef.current,
        { width: "0%" },
        { width: "100%", duration: TOTAL_DURATION, ease: "none" },
      );

      // --- Exit: photo dissolves, both letters slide to the screen edges
      // (flush), stop, then the preloader disappears. ---
      const exitAt = TOTAL_DURATION - 0.8; // letters stop exactly at TOTAL_DURATION
      const finish = () => {
        sessionStorage.setItem(OK_FLAG, "1");
        document.body.style.overflow = "";
        document.documentElement.classList.remove("avesta-loading");
        window.dispatchEvent(new Event("avesta.preloaded"));
        gsap.set(root, { display: "none" });
      };
      gsap.timeline({
        delay: exitAt,
        defaults: { ease: "circ.inOut" },
        onComplete: finish,
      })
        .to(photoWrap, { opacity: 0, scale: 0.85, duration: 0.5 }, 0)
        .to(
          leftA,
          {
            x: () => -leftA.getBoundingClientRect().left,
            duration: 0.8,
          },
          0,
        )
        .to(
          rightA,
          {
            x: () => window.innerWidth - rightA.getBoundingClientRect().right,
            duration: 0.8,
          },
          0,
        );
    }, root);

    return () => {
      ctx.revert();
      document.body.style.overflow = "";
      document.documentElement.classList.remove("avesta-loading");
    };
  }, [canShow]);

  if (!canShow) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 z-[100] flex h-screen w-screen items-center justify-center overflow-hidden bg-black"
    >
      {/* LEFT "A" */}
      <span
        ref={leftARef}
        className="avesta-a select-none font-sans font-extrabold leading-none text-white"
      >
        <span className="avesta-a-glyph">A</span>
      </span>

      {/* CENTER PHOTO */}
      <div
        ref={photoWrapRef}
        className="avesta-photo-wrap relative mx-[2vw] sm:mx-[2.5vw]"
        style={{ transform: "translateZ(0)" }}
      >
        {PRELOADER_IMAGES.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            draggable={false}
            className={`avesta-photo absolute inset-0 h-full w-full object-cover ${i === 0 ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="pointer-events-none absolute -inset-2 border border-white/60" />
      </div>

      {/* RIGHT "A" */}
      <span
        ref={rightARef}
        className="avesta-a select-none font-sans font-extrabold leading-none text-white"
      >
        <span className="avesta-a-glyph">A</span>
      </span>

      {/* PROGRESS BAR */}
      <div className="absolute bottom-8 left-1/2 z-30 w-40 -translate-x-1/2">
        <div className="h-px w-full bg-white/20">
          <div ref={barRef} className="h-full w-0 bg-white" />
        </div>
      </div>
    </div>
  );
}