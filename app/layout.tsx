import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
export const metadata: Metadata = {
  title: "EdgeFinder — Prediction Market Edge Tool",
  description: "Find arbitrage and +EV opportunities across Kalshi, Polymarket, and Robinhood prediction markets",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased bg-slate-950`}>{children}</body>
    </html>
  );
}