import type { Metadata } from "next";
import { Suspense } from "react";
import AccountClient from "@/components/account/AccountClient";

export const metadata: Metadata = { title: "Akun Saya" };

export default function AccountPage() {
  return (
    <Suspense>
      <AccountClient />
    </Suspense>
  );
}
