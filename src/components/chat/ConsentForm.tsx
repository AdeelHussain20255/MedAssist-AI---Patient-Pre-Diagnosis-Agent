"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldAlert, AlertTriangle, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

interface ConsentFormProps {
  onConsent: () => void;
  isLoading?: boolean;
}

export function ConsentForm({ onConsent, isLoading: externalLoading }: ConsentFormProps) {
  const t = useTranslations("consent");
  const [agreed, setAgreed] = React.useState(false);
  const [isRecording, setIsRecording] = React.useState(false);

  const handleAgree = async () => {
    if (!agreed) return;
    
    setIsRecording(true);
    try {
      // Record acceptance in DB
      await fetch('/api/consent/record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacyVersion: '1.0',
          termsVersion: '1.0'
        })
      });
      
      onConsent();
    } catch (error) {
      console.error('Failed to record consent', error);
      // We still proceed with the chat for UX, but log it
      onConsent();
    } finally {
      setIsRecording(false);
    }
  };

  const isLoading = externalLoading || isRecording;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      <Card className="border-t-4 border-t-amber-500 shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-2">
            <ShieldAlert size={32} />
          </div>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Medical Disclaimer */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-5 text-amber-900 flex gap-4">
            <AlertTriangle className="shrink-0 mt-1" size={24} />
            <p className="text-sm md:text-base leading-relaxed font-medium">
              {t("disclaimer")}
            </p>
          </div>

          {/* Emergency Note */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-5 text-red-900 flex items-center justify-between gap-4">
            <div className="font-semibold">{t("emergencyNote")}</div>
            <a 
              href="tel:1122" 
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
            >
              <PhoneCall size={18} />
              {t("emergencyNumber")}
            </a>
          </div>

          <div className="text-sm text-content-secondary text-center px-4">
            {t.rich("privacyNote", {
              privacy: (chunks) => (
                <a href="/privacy" target="_blank" className="text-brand-600 font-bold hover:underline">
                  {chunks}
                </a>
              ),
              terms: (chunks) => (
                <a href="/terms" target="_blank" className="text-brand-600 font-bold hover:underline">
                  {chunks}
                </a>
              ),
            })}
          </div>

          <div className="pt-4 border-t border-gray-100 space-y-4">
            <label className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors">
              <input 
                type="checkbox" 
                className="mt-1 w-5 h-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span className="text-content-primary font-medium">
                {t("checkboxLabel")}
              </span>
            </label>

            <Button 
              variant="primary" 
              className="w-full py-4 text-lg"
              disabled={!agreed || isLoading}
              isLoading={isLoading}
              onClick={handleAgree}
            >
              {t("agreeButton")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
