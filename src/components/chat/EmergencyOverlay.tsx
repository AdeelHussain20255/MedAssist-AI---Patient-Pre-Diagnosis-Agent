"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { AlertTriangle, PhoneCall, ShieldCheck } from "lucide-react";

interface EmergencyOverlayProps {
  requiresMentalHealth?: boolean;
}

export function EmergencyOverlay({ requiresMentalHealth = false }: EmergencyOverlayProps) {
  const t = useTranslations("emergency");

  // Prevent scrolling when emergency overlay is active
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-red-950/95 backdrop-blur-md p-4"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden"
      >
        <div className="bg-red-600 p-8 text-center text-white relative overflow-hidden">
          {/* Pulsing background effect */}
          <div className="absolute inset-0 bg-red-500 animate-pulse-slow opacity-50"></div>
          
          <div className="relative z-10 flex flex-col items-center">
            <AlertTriangle size={64} className="mb-4 animate-bounce-gentle" />
            <h2 className="text-3xl font-bold leading-tight mb-2 text-balance">
              {t("title")}
            </h2>
            <p className="text-red-100 text-lg">
              {t("subtitle")}
            </p>
          </div>
        </div>

        <div className="p-8 space-y-6 flex flex-col items-center text-center">
          <a
            href="tel:1122"
            className="w-full flex items-center justify-center gap-3 bg-red-600 text-white py-5 px-8 rounded-2xl text-2xl font-black shadow-lg hover:bg-red-700 hover:shadow-xl transition-all active:scale-95 animate-pulse"
            style={{ animationDuration: '2s' }}
          >
            <PhoneCall size={32} />
            {t("callButton")}
          </a>

          <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-full font-medium">
            <ShieldCheck size={20} />
            {t("clinicNotified")}
          </div>

          {requiresMentalHealth && (
            <div className="w-full mt-4 p-5 bg-purple-50 border border-purple-200 rounded-2xl text-left">
              <h3 className="font-bold text-purple-900 mb-1">{t("mentalHealthTitle")}</h3>
              <p className="text-purple-800 text-sm mb-3">{t("mentalHealthDesc")}</p>
              <a 
                href="tel:03117786264" 
                className="inline-flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-purple-700 transition-colors"
              >
                <PhoneCall size={18} />
                {t("mentalHealthLine")}
              </a>
            </div>
          )}

          <p className="text-content-secondary text-sm pt-4 border-t w-full">
            {t("doNotDismiss")}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
