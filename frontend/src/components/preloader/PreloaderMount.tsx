"use client";

import dynamic from "next/dynamic";

const Preloader = dynamic(() => import("@/components/preloader/Preloader"), {
  ssr: false,
  loading: () => null,
});

export default function PreloaderMount() {
  return <Preloader />;
}