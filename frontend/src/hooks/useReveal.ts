"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Custom hook that reveals elements on scroll with GSAP + ScrollTrigger.
 * Attach the returned ref to the container; children with [data-reveal] will animate.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  stagger?: number;
  y?: number;
}) {
  const { stagger = 0.1, y = 40 } = options ?? {};
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const targets = el.querySelectorAll("[data-reveal]");

    const ctx = gsap.context(() => {
      gsap.fromTo(
        targets,
        { y, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
          },
        },
      );
    }, el);

    return () => ctx.revert();
  }, [stagger, y]);

  return ref;
}
