import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { ToastProvider } from "@/components/Toast";

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
      <head>
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />
      </head>
      <body
        className={`${geistMono.variable} antialiased bg-[#FCFCFC] min-h-screen`}
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
