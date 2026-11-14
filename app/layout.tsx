import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ChatbotWidget } from "@/components/chatbot-widget";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { CartDrawer } from "@/components/cart-drawer";
import { StoreProvider } from "@/components/store-provider";

const display = localFont({
  src: "./fonts/cormorant-garamond-latin.woff2",
  variable: "--font-display",
  weight: "400 700",
  style: "normal",
  display: "swap",
  fallback: ["Times New Roman"],
});

const sans = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-sans",
  weight: "100 900",
  style: "normal",
  display: "swap",
  fallback: ["Arial"],
});

export const metadata: Metadata = {
  title: "Princess Bloom | Votre bien-être discret",
  description:
    "Boutique premium Princess Bloom — ceinture chauffante et massante pensée pour accompagner vos journées avec douceur.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable} h-full`}>
      <body className="min-h-screen bg-[#F9F0EC] text-[#493238] antialiased">
        <StoreProvider>
          <div className="site-promo overflow-hidden bg-[#493238] text-white">
            <div className="py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.22em]">
              <div className="promo-track">
                <span>CODE PRINCESSBLOOM5 • -5% sur votre commande •</span>
                <span>CODE PRINCESSBLOOM5 • -5% sur votre commande •</span>
                <span>CODE PRINCESSBLOOM5 • -5% sur votre commande •</span>
              </div>
            </div>
          </div>
          <SiteHeader />
          <div className="min-h-[calc(100vh-13rem)]">{children}</div>
          <SiteFooter />
          <ChatbotWidget />
          <CartDrawer />
        </StoreProvider>
      </body>
    </html>
  );
}
