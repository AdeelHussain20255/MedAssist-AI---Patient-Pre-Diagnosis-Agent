"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { CalendarClock, CheckCircle2, Info, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { TriageLevel } from "@/lib/triage-engine";

interface TriageResultProps {
  level: TriageLevel;
  homeCareAdvice?: string;
  onBookAppointment: () => void;
}

export function TriageResult({ level, homeCareAdvice, onBookAppointment }: TriageResultProps) {
  const t = useTranslations("triage");

  if (level === "CRITICAL") return null; // CRITICAL uses the EmergencyOverlay instead

  const isUrgent = level === "URGENT";
  
  const colors = isUrgent 
    ? { bg: "bg-amber-50", border: "border-amber-200", icon: "text-amber-600", text: "text-amber-900" }
    : { bg: "bg-green-50", border: "border-green-200", icon: "text-green-600", text: "text-green-900" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-2xl mx-auto my-8"
    >
      <div className={`rounded-2xl border ${colors.border} ${colors.bg} overflow-hidden shadow-lg`}>
        <div className="p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className={`p-3 bg-white rounded-full shadow-sm ${colors.icon}`}>
              {isUrgent ? <Info size={32} /> : <CheckCircle2 size={32} />}
            </div>
            
            <div className="flex-1">
              <h2 className={`text-2xl font-bold mb-2 ${colors.text}`}>
                {t("resultTitle")}: {isUrgent ? t("urgent") : t("mild")}
              </h2>
              <p className={`text-lg mb-6 ${colors.text} opacity-90`}>
                {isUrgent ? t("urgentDesc") : t("mildDesc")}
              </p>

              {homeCareAdvice && (
                <div className="mb-6 p-4 bg-white/60 rounded-xl border border-white/40">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Info size={18} className="text-brand-600" />
                    {t("homeCare")}
                  </h3>
                  <p className="text-sm text-content-secondary leading-relaxed">
                    {homeCareAdvice}
                  </p>
                </div>
              )}

              <Button
                variant="primary"
                size="lg"
                onClick={onBookAppointment}
                className="w-full sm:w-auto flex items-center gap-2 shadow-md hover:shadow-lg"
              >
                <CalendarClock size={20} />
                {t("bookAppointment")}
                <ArrowRight size={20} className="ml-1" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
