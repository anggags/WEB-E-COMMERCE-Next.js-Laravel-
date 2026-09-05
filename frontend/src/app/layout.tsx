import type { Metadata } from "next";
import { Cormorant_Garamond, Geist, Geist_Mono } from "next/font/google";
import { SmoothScrollProvider } from "@/components/providers/AnimationProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import ToastContainer from "@/components/ui/ToastContainer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Toko Online",
    template: "%s | Toko Online",
  },
  description: "Belanja produk favorit Anda di toko online terpercaya.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="id" className={`${geistSans.variable} ${geistMono.variable} ${display.variable}`}>
      <body className="min-h-full flex flex-col">
        <SmoothScrollProvider>
          <AuthProvider />
          <CartDrawer />
          <ToastContainer />
          <Header />
          <main className="flex-1 page-enter">{children}</main>
          <Footer />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
