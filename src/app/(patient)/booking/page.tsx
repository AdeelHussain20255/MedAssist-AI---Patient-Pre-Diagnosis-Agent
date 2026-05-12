"use client";

import * as React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { v4 as uuidv4 } from "uuid";
import { Calendar, User, Mail, Phone, ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { BookingSchema, type Booking } from "@/lib/validations";
import { Skeleton } from "@/components/ui/Skeleton";

export default function BookingPage() {
  const t = useTranslations("booking");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const sessionId = searchParams.get("sessionId");
  const level = searchParams.get("level");

  // Prevent CRITICAL cases from accessing this page manually
  React.useEffect(() => {
    if (level === "CRITICAL" || !sessionId) {
      router.push("/");
    }
  }, [level, sessionId, router]);

  const [isLoadingSlots, setIsLoadingSlots] = React.useState(true);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedSlot, setSelectedSlot] = React.useState<string | null>(null);

  // Mock slot fetching
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoadingSlots(false);
    }, 1500); // Simulate network latency
    return () => clearTimeout(timer);
  }, []);

  const {
    register,
    handleSubmit,
    setValue,
    clearErrors,
    formState: { errors },
  } = useForm<Booking>({
    resolver: zodResolver(BookingSchema),
    defaultValues: {
      sessionId: sessionId || "",
      slotId: "", // Set when a slot is clicked
    }
  });

  const handleSlotClick = (slotId: string) => {
    setSelectedSlot(slotId);
    setValue("slotId", slotId);
    clearErrors("slotId");
  };

  const onSubmit = async (data: Booking) => {
    if (!selectedSlot) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, slotId: selectedSlot })
      });

      if (!response.ok) {
        throw new Error("Booking failed");
      }

      const result = await response.json();
      router.push(`/confirmation?id=${result.appointmentId}&date=${encodeURIComponent(result.date)}&time=${encodeURIComponent(result.time)}&provider=${encodeURIComponent(result.provider)}`);
      
    } catch (error) {
      console.error(error);
      alert(tCommon("error"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!sessionId || level === "CRITICAL") return null;

  const isUrgent = level === "URGENT";

  return (
    <div className="flex-1 bg-surface-secondary py-8 px-4 flex flex-col items-center">
      <div className="w-full max-w-2xl mb-6 flex items-center justify-between">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-content-secondary hover:text-content-primary transition-colors">
          <ArrowLeft size={20} />
          <span>{tCommon("back")}</span>
        </button>
      </div>

      <Card className="w-full max-w-2xl shadow-elevated">
        <CardHeader className="bg-brand-50 border-b border-brand-100 rounded-t-2xl pb-8">
          <CardTitle className="text-2xl text-brand-900 flex items-center gap-3">
            <Calendar className="text-brand-600" />
            {t("title")}
          </CardTitle>
          <CardDescription className="text-brand-700/80 mt-2 text-lg">
            {isUrgent ? t("slotType.priority") : t("slotType.routine")}
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            
            {/* Slot Selection */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-content-primary">{t("selectSlot")}</h3>
              {isLoadingSlots ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                  <Skeleton className="h-16 w-full rounded-xl" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {/* Mock slots with valid UUIDs and unique times */}
                  {[
                    { id: "e6f47053-247a-4a64-9f7a-8f8f04179373", time: "10:00 AM" },
                    { id: "b2c9d4a1-0e1f-4c8d-9b8a-7e6d5c4b3a2f", time: "11:00 AM" },
                    { id: "a1b2c3d4-e5f6-4071-8293-a4b5c6d7e8f9", time: "12:00 PM" },
                  ].map((slot) => {
                    const isSelected = selectedSlot === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSlotClick(slot.id)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          isSelected 
                            ? "border-brand-600 bg-brand-50 text-brand-900 shadow-md ring-2 ring-brand-600 ring-offset-1" 
                            : "border-gray-200 hover:border-brand-300 hover:bg-gray-50 text-content-secondary"
                        }`}
                      >
                        <div className="font-bold text-lg mb-1">{isUrgent ? "Tomorrow" : "Next Week"}</div>
                        <div className="text-sm opacity-80">{slot.time}</div>
                      </button>
                    )
                  })}
                </div>
              )}
              {errors.slotId && <p className="text-red-500 text-sm mt-2">{errors.slotId.message}</p>}
            </div>

            <hr className="border-gray-100" />

            {/* Patient Details */}
            <div className="space-y-4">
              <div className="relative">
                <label className="text-sm font-medium text-content-secondary mb-1 block">{t("yourName")}</label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 text-gray-400" size={18} />
                  <Input 
                    {...register("patientName")} 
                    error={errors.patientName?.message}
                    className="pl-10"
                    placeholder="Ali Khan"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-content-secondary mb-1 block">{t("yourEmail")}</label>
                <div className="relative flex items-center">
                  <Mail className="absolute left-3 text-gray-400" size={18} />
                  <Input 
                    {...register("patientEmail")} 
                    type="email"
                    error={errors.patientEmail?.message}
                    className="pl-10"
                    placeholder="ali@example.com"
                  />
                </div>
              </div>

              <div className="relative">
                <label className="text-sm font-medium text-content-secondary mb-1 block">{t("yourPhone")}</label>
                <div className="relative flex items-center">
                  <Phone className="absolute left-3 text-gray-400" size={18} />
                  <Input 
                    {...register("patientPhone")} 
                    type="tel"
                    error={errors.patientPhone?.message}
                    className="pl-10"
                    placeholder="03001234567"
                  />
                </div>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full text-lg shadow-md hover:shadow-lg"
              disabled={!selectedSlot || isSubmitting || isLoadingSlots}
              isLoading={isSubmitting}
            >
              {t("confirmBooking")}
            </Button>
            
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
