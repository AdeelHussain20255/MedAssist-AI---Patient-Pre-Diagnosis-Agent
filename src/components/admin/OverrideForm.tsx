"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface OverrideFormProps {
  sessionId: string;
  currentLevel: string;
}

export default function OverrideForm({ sessionId, currentLevel }: OverrideFormProps) {
  const router = useRouter();
  const [level, setLevel] = React.useState(currentLevel);
  const [reason, setReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.length < 10) {
      setError("Please provide a reason (min 10 chars)");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/override", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, newLevel: level, reason })
      });

      if (!res.ok) throw new Error("Failed to update");

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        router.refresh();
      }, 2000);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm font-semibold text-gray-900">Override Triage Level</p>
      
      <div className="flex gap-2">
        {['MILD', 'URGENT', 'CRITICAL'].map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLevel(l)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border-2 transition-all ${
              level === l 
                ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm" 
                : "border-gray-100 text-gray-400 hover:border-gray-200"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason for override..."
          className="w-full h-24 p-3 text-sm rounded-lg border border-gray-200 focus:ring-2 focus:ring-brand-500 focus:outline-none resize-none"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 text-green-600 text-sm bg-green-50 p-2 rounded-md">
          <CheckCircle2 size={16} />
          Updated successfully!
        </div>
      )}

      <Button
        type="submit"
        variant="primary"
        className="w-full"
        disabled={level === currentLevel || isSubmitting}
        isLoading={isSubmitting}
      >
        Save Override
      </Button>
    </form>
  );
}
