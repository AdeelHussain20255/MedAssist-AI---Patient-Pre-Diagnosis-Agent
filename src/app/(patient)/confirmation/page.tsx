"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, Calendar, Clock, User, MailCheck, Home } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function ConfirmationPage() {
  const t = useTranslations("confirmation");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const id = searchParams.get("id");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const provider = searchParams.get("provider");

  if (!id || !date || !time) {
    // If accessed directly without params, go home
    if (typeof window !== 'undefined') {
      router.push("/");
    }
    return null;
  }

  return (
    <div className="flex-1 bg-surface-secondary py-12 px-4 flex flex-col items-center justify-center min-h-[80vh]">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-xl"
      >
        <Card className="shadow-2xl overflow-hidden border-0 relative">
          <div className="absolute top-0 left-0 right-0 h-2 bg-green-500"></div>
          
          <div className="p-8 pb-0 text-center flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6"
            >
              <CheckCircle2 size={40} />
            </motion.div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3 text-balance">
              {t("title")}
            </h1>
            <p className="text-gray-500 text-lg max-w-md mx-auto text-balance">
              {t("subtitle")}
            </p>
          </div>

          <CardContent className="p-8 pt-6">
            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4 mb-8">
              <h3 className="font-semibold text-gray-900 mb-4">{t("appointmentDetails")}</h3>
              
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="text-brand-600 w-5 h-5" />
                <span className="font-medium">{date}</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                <Clock className="text-brand-600 w-5 h-5" />
                <span className="font-medium">{time}</span>
              </div>
              
              <div className="flex items-center gap-3 text-gray-700">
                <User className="text-brand-600 w-5 h-5" />
                <span className="font-medium">{provider}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-green-700 bg-green-50 p-4 rounded-xl font-medium mb-8">
              <MailCheck className="w-5 h-5 shrink-0" />
              <span>{t("emailSent")}</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.print()}
              >
                {t("addToCalendar")} {/* Ideally generates .ics, MVP just print/save */}
              </Button>
              <Button 
                variant="primary" 
                className="w-full flex items-center justify-center gap-2"
                onClick={() => router.push("/")}
              >
                <Home size={18} />
                {tNav("home")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
