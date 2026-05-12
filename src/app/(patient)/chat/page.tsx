"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Send, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

import { ConsentForm } from "@/components/chat/ConsentForm";
import { ChatBubble } from "@/components/chat/ChatBubble";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { EmergencyOverlay } from "@/components/chat/EmergencyOverlay";
import { TriageResult } from "@/components/chat/TriageResult";
import type { TriageLevel } from "@/lib/triage-engine";

type Message = {
  id: string;
  content: string;
  role: "user" | "model";
  timestamp: Date;
};

type TriageData = {
  level: TriageLevel;
  homeCareAdvice?: string;
  requiresMentalHealthResources?: boolean;
};

export default function ChatPage() {
  const t = useTranslations();
  const router = useRouter();
  
  const [sessionId, setSessionId] = React.useState<string>("");
  const [hasConsented, setHasConsented] = React.useState(false);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [isTyping, setIsTyping] = React.useState(false);
  const [turnCount, setTurnCount] = React.useState(0);
  
  const [triageData, setTriageData] = React.useState<TriageData | null>(null);
  
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, triageData]);

  const handleConsent = () => {
    // Generate session ID upon consent
    const newSessionId = uuidv4();
    setSessionId(newSessionId);
    setHasConsented(true);
    
    // Add initial greeting
    setMessages([
      {
        id: "msg-0",
        content: t("chat.greeting"),
        role: "model",
        timestamp: new Date()
      }
    ]);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping || triageData) return;

    const userMessage = input.trim();
    setInput("");
    
    const newUserMsg: Message = {
      id: uuidv4(),
      content: userMessage,
      role: "user",
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMsg]);
    setIsTyping(true);
    setTurnCount(prev => prev + 1);

    try {
      // 1. Send to Chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          sessionId: sessionId,
          language: t("common.english") === "English" ? "en" : "ur"
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(t("errors.rateLimit"));
        }
        throw new Error(t("errors.generic"));
      }

      const data = await response.json();

      // 2. Handle Critical Redirect from Red Flags
      if (data.type === "critical_redirect") {
        setIsTyping(false);
        setTriageData({
          level: "CRITICAL",
          requiresMentalHealthResources: data.isMentalHealth
        });
        return;
      }

      // 3. Add AI Response
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: data.content,
        role: "model",
        timestamp: new Date()
      }]);

      // 4. Check if we should trigger final triage
      // For MVP, we trigger triage after 3 user turns or if the AI suggests it
      if (turnCount >= 2) {
        await handleFinalTriage(userMessage);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: uuidv4(),
        content: t("errors.generic"),
        role: "model",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleFinalTriage = async (lastUserMessage: string) => {
    setIsTyping(true);
    try {
      const response = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          primarySymptom: lastUserMessage, 
          additionalSymptoms: [] 
        })
      });

      if (!response.ok) throw new Error("Triage failed");

      const data = await response.json();
      setTriageData(data);
    } catch (error) {
      console.error(error);
      // Fallback
      setTriageData({ level: "URGENT" });
    } finally {
      setIsTyping(false);
    }
  };

  const navigateToBooking = () => {
    router.push(`/booking?sessionId=${sessionId}&level=${triageData?.level}`);
  };

  // View States
  if (!hasConsented) {
    return (
      <div className="flex-1 flex flex-col bg-surface-primary">
        <header className="p-4 flex items-center border-b border-gray-100 bg-white">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-content-secondary" />
          </button>
        </header>
        <ConsentForm onConsent={handleConsent} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-surface-secondary relative max-h-screen">
      
      {triageData?.level === "CRITICAL" && (
        <EmergencyOverlay requiresMentalHealth={triageData.requiresMentalHealthResources} />
      )}

      {/* Header */}
      <header className="p-4 flex items-center justify-between border-b border-gray-200 bg-white shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/")} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} className="text-content-secondary" />
          </button>
          <div>
            <h1 className="font-semibold text-content-primary">MedAssist AI</h1>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Online
            </p>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4">
        <div className="max-w-3xl mx-auto flex flex-col pb-4">
          
          <p className="text-xs text-center text-content-tertiary mb-6 font-medium bg-gray-100/50 py-1 px-3 rounded-full self-center">
            {t("chat.disclaimer")}
          </p>

          {messages.map((msg) => (
            <ChatBubble 
              key={msg.id} 
              message={msg.content} 
              isUser={msg.role === "user"}
            />
          ))}
          
          {isTyping && <TypingIndicator />}

          {triageData && triageData.level !== "CRITICAL" && (
            <TriageResult 
              level={triageData.level} 
              homeCareAdvice={triageData.homeCareAdvice}
              onBookAppointment={navigateToBooking} 
            />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4 shrink-0">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSendMessage} className="relative flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isTyping || triageData !== null}
              placeholder={triageData ? t("chat.sessionEnd") : t("chat.placeholder")}
              className="w-full h-14 pl-4 pr-14 rounded-2xl border border-gray-300 bg-surface-secondary focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[15px]"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping || triageData !== null}
              className="w-10 h-10 flex items-center justify-center bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors shadow-sm"
            >
              <Send size={18} className="ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
