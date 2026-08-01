import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import { CartProvider } from "@/context/CartContext";
import { UiProvider } from "@/context/UiContext";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { StatusPanel } from "@/components/layout/StatusPanel";
import { BrandTicker } from "@/components/layout/BrandTicker";
import { Header } from "@/components/layout/Header";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/ui/SearchOverlay";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NapFleet | Vehicle-Shaped Dog Beds for Big Dreamers",
  description:
    "Shop helicopter, fighter jet, tank, truck, and patrol boat dog beds from NapFleet. Soft, padded pet beds with unforgettable adventure-inspired designs.",
  openGraph: {
    title: "NapFleet | Vehicle-Shaped Dog Beds for Big Dreamers",
    description:
      "Shop helicopter, fighter jet, tank, truck, and patrol boat dog beds from NapFleet.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${barlowCondensed.variable} ${inter.variable}`}>
      <body className="font-body min-h-screen flex flex-col bg-warm-white text-charcoal">
        <UiProvider>
          <CartProvider>
            <AnnouncementBar />
            <StatusPanel />
            <BrandTicker />
            <Header />
            <CartDrawer />
            <SearchOverlay />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </UiProvider>
      </body>
    </html>
  );
}
