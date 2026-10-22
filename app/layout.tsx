import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StoreProvider } from "@/components/store-provider";

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
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
          <div className="overflow-hidden bg-[#493238] text-white">
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
        </StoreProvider>
      </body>
    </html>
  );
}
