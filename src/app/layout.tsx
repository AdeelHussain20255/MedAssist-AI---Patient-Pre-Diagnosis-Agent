import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Noto_Nastaliq_Urdu } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const urduFont = Noto_Nastaliq_Urdu({ 
  weight: ["400", "500", "600", "700"],
  subsets: ["arabic"], 
  variable: "--font-urdu" 
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1e3a8a" },
  ],
};

export const metadata: Metadata = {
  title: {
    template: "%s | MedAssist AI",
    default: "MedAssist AI - Smart Patient Pre-Screening",
  },
  description: "AI-powered patient pre-screening and triage system. Get triaged before you visit the clinic.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const isUrdu = locale === "ur";

  return (
    <ClerkProvider>
      <html lang={locale} dir={isUrdu ? "rtl" : "ltr"} suppressHydrationWarning>
        <body
          className={`${inter.variable} ${urduFont.variable} font-sans antialiased bg-surface-primary text-content-primary min-h-screen flex flex-col`}
        >
          <NextIntlClientProvider messages={messages}>
            {children}
          </NextIntlClientProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
