"use client";

import { useEffect, type ReactNode } from "react";
import type { default as LenisConstructor } from "lenis";

type LenisInstance = InstanceType<typeof LenisConstructor>;

/**
 * Providers smooth scrolling (Lenis) integrated with GSAP's ticker so that
 * ScrollTrigger-driven animations stay in sync with the smooth scroll.
 */
export function SmoothScrollProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    let lenis: LenisInstance | null = null;
    let gsapMod: typeof import("gsap") | null = null;
    let disposed = false;
    const gsapTickerCallback = (time: number) => {
      lenis?.raf(time * 1000);
    };

    (async () => {
      try {
        const [{ default: Lenis }, gsapNs, ScrollTriggerNs] = await Promise.all([
          import("lenis"),
          import("gsap"),
          import("gsap/ScrollTrigger"),
        ]);

        if (disposed) return;

        lenis = new Lenis({
          duration: 1.1,
          smoothWheel: true,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });

        gsapMod = gsapNs;
        gsapMod.gsap.registerPlugin(ScrollTriggerNs.ScrollTrigger);

        lenis.on("scroll", ScrollTriggerNs.ScrollTrigger.update);
        gsapMod.gsap.ticker.add(gsapTickerCallback);
        gsapMod.gsap.ticker.lagSmoothing(0);
      } catch (err) {
        console.error("Failed to initialize smooth scroll:", err);
      }
    })();

    return () => {
      disposed = true;
      if (gsapMod) gsapMod.gsap.ticker.remove(gsapTickerCallback);
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
