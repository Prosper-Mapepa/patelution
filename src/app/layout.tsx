import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Patelution – The Padel Platform",
  description:
    "Patelution is a beautiful, modern web platform for running Americano and Mexicano padel tournaments, tracking standings, and organizing your padel community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <div className="flex min-h-svh flex-col bg-gradient-to-b from-slate-950 via-slate-950 to-black">
          <BottomNav />
          <main className="flex w-full flex-1 flex-col px-4 pb-12 pt-8 sm:px-8 lg:px-12">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
