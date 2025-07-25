import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Secure Auth App",
  description: "A comprehensive authentication application with Next.js",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="min-h-screen flex flex-col justify-center px-10 items-center">
            <Toaster position="bottom-center" closeButton={true} />
            <Header />
            <main className="flex-1">{children}</main>

            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
