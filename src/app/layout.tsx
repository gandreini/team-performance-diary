import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ToastProvider } from "@/components/Toast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Team Performance Diary",
  description: "Track performance information about your direct reports throughout review cycles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#FCFCFC] min-h-screen`}
      >
        <ToastProvider>
          <Header />
          <main className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
