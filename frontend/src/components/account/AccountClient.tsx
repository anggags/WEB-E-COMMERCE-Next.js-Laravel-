"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import ProfileSection from "@/components/account/ProfileSection";
import OrdersSection from "@/components/account/OrdersSection";
import AddressSection from "@/components/account/AddressSection";
import WishlistSection from "@/components/account/WishlistSection";

const TABS = [
  { key: "profile", label: "Profil" },
  { key: "orders", label: "Pesanan" },
  { key: "addresses", label: "Alamat" },
  { key: "wishlist", label: "Wishlist" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function AccountTabs() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, status, fetchUser, logout } = useAuthStore();
  const [tab, setTab] = useState<TabKey>(
    (searchParams.get("tab") as TabKey) || "profile",
  );

  useEffect(() => {
    if (status === "loading") fetchUser();
  }, [status, fetchUser]);

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
  }, [status, router]);

  function switchTab(key: TabKey) {
    setTab(key);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", key);
    router.replace(`/account?${params.toString()}`, { scroll: false });
  }

  if (status !== "authenticated" || !user) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-zinc-500">
        Memeriksa sesi...
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-baseline justify-between gap-4">
        <h1 className="text-3xl font-bold text-zinc-900">Akun Saya</h1>
        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          className="text-sm font-medium text-zinc-400 transition-colors hover:text-red-500"
        >
          Keluar
        </button>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-zinc-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              tab === t.key
                ? "border-zinc-900 text-zinc-900"
                : "border-transparent text-zinc-400 hover:text-zinc-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "profile" && <ProfileSection user={user} />}
        {tab === "orders" && <OrdersSection />}
        {tab === "addresses" && <AddressSection />}
        {tab === "wishlist" && <WishlistSection />}
      </div>
    </div>
  );
}

export default function AccountClient() {
  return (
    <Suspense>
      <AccountTabs />
    </Suspense>
  );
}
