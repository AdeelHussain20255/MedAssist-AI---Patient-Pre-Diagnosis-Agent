"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Activity, ShieldAlert } from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/Button";

export function Header() {
  const t = useTranslations("nav");
  const { user, isLoaded } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-40 px-6 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 font-bold text-xl text-brand-700">
        <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center text-white shadow-brand-200 shadow-lg">
          <Activity size={24} />
        </div>
        <span className="hidden sm:inline">MedAssist AI</span>
      </Link>

      <nav className="hidden md:flex items-center gap-8">
        <Link href="/" className="text-content-secondary hover:text-brand-600 font-semibold transition-colors">{t("home")}</Link>
        <Link href="/about" className="text-content-secondary hover:text-brand-600 font-semibold transition-colors">{t("howItWorks")}</Link>
        <Link href="/faq" className="text-content-secondary hover:text-brand-600 font-semibold transition-colors">{t("faq")}</Link>
        <Link href="/contact" className="text-content-secondary hover:text-brand-600 font-semibold transition-colors">Contact</Link>
      </nav>

      <div className="flex items-center gap-4">
        {isLoaded && user ? (
          <div className="flex items-center gap-4">
            {isAdmin && (
              <Link href="/admin/dashboard" className="text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors mr-2">
                Staff Portal
              </Link>
            )}
            <UserButton />
          </div>
        ) : isLoaded ? (
          <Link href="/chat">
            <Button variant="primary" className="hidden sm:flex shadow-md">
              {t("startChat")}
            </Button>
          </Link>
        ) : (
          <div className="w-10 h-10 bg-gray-100 animate-pulse rounded-full"></div>
        )}
        
        <a href="tel:1122" className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold border border-red-100 hover:bg-red-100 transition-colors">
          <ShieldAlert size={18} />
          <span className="hidden xs:inline">1122</span>
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 px-6 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        <div className="col-span-1 md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 font-bold text-xl text-brand-700">
            <Activity size={24} />
            MedAssist AI
          </div>
          <p className="text-content-secondary max-w-sm leading-relaxed">
            {t("disclaimer")}
          </p>
        </div>
        
        <div>
          <h4 className="font-bold text-gray-900 mb-4">Quick Links</h4>
          <ul className="space-y-2 text-content-secondary">
            <li><Link href="/" className="hover:text-brand-600">{tNav("home")}</Link></li>
            <li><Link href="/about" className="hover:text-brand-600">{tNav("howItWorks")}</Link></li>
            <li><Link href="/contact" className="hover:text-brand-600">{tNav("contact")}</Link></li>
            <li><Link href="/admin/dashboard" className="hover:text-brand-600">{tNav("admin")}</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold text-gray-900 mb-4">Legal</h4>
          <ul className="space-y-2 text-content-secondary">
            <li><Link href="/privacy" className="hover:text-brand-600">{tNav("privacy")}</Link></li>
            <li><Link href="/terms" className="hover:text-brand-600">{tNav("terms")}</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-content-tertiary">
        <p>{t("copyright")}</p>
        <p className="flex items-center gap-1">{t("madeWith")}</p>
      </div>
    </footer>
  );
}
