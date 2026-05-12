"use client";

import * as React from "react";
import CookieConsent from "react-cookie-consent";
import { useTranslations } from "next-intl";
import Link from "next/link";

export function CookieBanner() {
  const t = useTranslations("cookie");

  return (
    <CookieConsent
      location="bottom"
      buttonText={t("accept")}
      declineButtonText={t("decline")}
      enableDeclineButton
      cookieName="medassist-consent"
      style={{ 
        background: "#0f172a", 
        color: "#f8fafc",
        padding: "1rem",
        fontSize: "14px",
        fontFamily: "Inter, sans-serif",
        boxShadow: "0 -10px 15px -3px rgb(0 0 0 / 0.1)"
      }}
      buttonStyle={{ 
        background: "#3b82f6", 
        color: "white", 
        fontSize: "13px", 
        fontWeight: "bold",
        borderRadius: "8px",
        padding: "8px 24px"
      }}
      declineButtonStyle={{
        background: "transparent",
        color: "#94a3b8",
        fontSize: "13px",
        padding: "8px 16px"
      }}
      expires={150}
    >
      {t("message")}{" "}
      <Link href="/privacy" className="text-brand-400 underline hover:text-brand-300">
        {t("privacyLink")}
      </Link>
    </CookieConsent>
  );
}
