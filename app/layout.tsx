import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppLayoutWrapper } from "@/components/layout/AppLayoutWrapper";
import { CurrencyProvider } from "@/providers/CurrencyProvider";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "Vando — Caisse enregistreuse simple",
  description: "Enregistrez vos ventes et générez vos reçus en toute simplicité.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} min-h-screen bg-[#F8FAFC]`}>
        <CurrencyProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </CurrencyProvider>
      </body>
    </html>
  );
}
