"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CalendarX, Home } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function ManageAppointmentPage() {
  const t = useTranslations("manage");
  const tNav = useTranslations("nav");
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isCancelling, setIsCancelling] = React.useState(false);
  const [isCancelled, setIsCancelled] = React.useState(false);

  if (!token) {
    if (typeof window !== 'undefined') router.push("/");
    return null;
  }

  const handleCancel = async () => {
    if (!confirm(t("cancelConfirm"))) return;
    
    setIsCancelling(true);
    try {
      const res = await fetch("/api/appointments/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token })
      });

      if (!res.ok) throw new Error("Failed to cancel");
      
      setIsCancelled(true);
    } catch (error) {
      alert("Something went wrong. Please contact the clinic.");
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="flex-1 bg-surface-secondary py-12 px-4 flex flex-col items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-lg">
        <Card className="shadow-lg">
          <div className="p-8 pb-0 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6">
              <CalendarX size={32} />
            </div>
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {t("title")}
            </h1>
          </div>

          <CardContent className="p-8 pt-6 text-center space-y-6">
            {isCancelled ? (
              <div className="bg-green-50 text-green-800 p-4 rounded-xl border border-green-200 font-medium">
                {t("cancelled")}
              </div>
            ) : (
              <>
                <p className="text-content-secondary mb-6">{t("cancelConfirm")}</p>
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="danger" 
                    className="w-full text-lg py-4"
                    onClick={handleCancel}
                    isLoading={isCancelling}
                  >
                    {t("cancelButton")}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-lg py-4"
                    onClick={() => router.push("/")}
                    disabled={isCancelling}
                  >
                    {tNav("home")}
                  </Button>
                </div>
              </>
            )}
            
            {isCancelled && (
              <Button 
                variant="primary" 
                className="w-full flex items-center justify-center gap-2 mt-6"
                onClick={() => router.push("/")}
              >
                <Home size={18} />
                {tNav("home")}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
