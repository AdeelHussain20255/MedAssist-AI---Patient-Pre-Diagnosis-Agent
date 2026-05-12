"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";

const faqs = [
  {
    category: "About the AI",
    questions: [
      {
        q: "Is MedAssist AI a substitute for a doctor?",
        a: "No. MedAssist AI is a pre-screening tool designed to help you understand the urgency of your symptoms and prepare you for your visit. It does not provide medical diagnoses or treatment plans."
      },
      {
        q: "How accurate is the triage engine?",
        a: "Our engine uses established clinical guidelines to categorize symptoms. While designed to identify red flags and urgency, it is always best to consult with a medical professional for a complete evaluation."
      }
    ]
  },
  {
    category: "Appointments & Booking",
    questions: [
      {
        q: "How do I book an appointment after the chat?",
        a: "At the end of your triage session, the AI will provide a 'Book Now' button. This will show you available time slots based on your triage level (Mild or Urgent)."
      },
      {
        q: "Will I receive a confirmation email?",
        a: "Yes! Once you book, we will send a confirmation email to the address provided, followed by reminders 24 hours and 1 hour before your appointment."
      }
    ]
  },
  {
    category: "Safety & Privacy",
    questions: [
      {
        q: "What happens if I have an emergency?",
        a: "If our system detects life-threatening symptoms (red flags), it will immediately stop the chat and provide emergency contact information (1122) and clinic directions."
      },
      {
        q: "Is my personal data secure?",
        a: "Absolutely. We use industry-standard encryption and Clerk authentication to ensure your health information is only accessible by you and the clinic's medical staff."
      }
    ]
  }
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = React.useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <section className="bg-white border-b border-slate-100 py-24 px-6 relative overflow-hidden text-center">
        <div className="absolute top-0 left-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -z-0 opacity-50"></div>
        <div className="max-w-3xl mx-auto space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 px-4 py-2 rounded-full text-brand-700 text-sm font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Got Questions?</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Frequently Asked <span className="text-brand-600">Questions</span>
          </h1>
          <p className="text-xl text-slate-500 leading-relaxed max-w-2xl mx-auto">
            Everything you need to know about our AI-powered triage and appointment system.
          </p>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto space-y-16">
          {faqs.map((cat, catIdx) => (
            <div key={catIdx} className="space-y-8">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                <div className="w-2 h-8 bg-brand-600 rounded-full"></div>
                {cat.category}
              </h2>
              <div className="space-y-4">
                {cat.questions.map((item, qIdx) => {
                  const id = `${catIdx}-${qIdx}`;
                  const isOpen = openIndex === id;
                  
                  return (
                    <div 
                      key={qIdx} 
                      className={`group border rounded-[2rem] transition-all duration-300 ${isOpen ? "bg-white border-brand-100 shadow-xl" : "bg-white border-slate-100 hover:border-brand-200"}`}
                    >
                      <button 
                        onClick={() => toggleFAQ(id)}
                        className="w-full text-left px-8 py-6 flex items-center justify-between gap-4"
                      >
                        <h3 className={`font-bold text-lg transition-colors ${isOpen ? "text-brand-600" : "text-slate-900"}`}>
                          {item.q}
                        </h3>
                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${isOpen ? "bg-brand-600 text-white rotate-180" : "bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600"}`}>
                          <ChevronDown size={20} />
                        </div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-8 pb-8 text-slate-500 leading-relaxed text-[17px] border-t border-slate-50 pt-4">
                              {item.a}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900 text-white py-24 px-6 mx-6 mb-12 rounded-[4rem] text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl -z-0"></div>
        <div className="max-w-2xl mx-auto space-y-8 relative z-10">
          <h2 className="text-3xl font-black">Still have questions?</h2>
          <p className="text-slate-400 text-lg">Can't find the answer you're looking for? Please contact our clinic staff directly.</p>
          <div className="pt-4">
            <a href="/contact" className="inline-flex items-center gap-2 bg-brand-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-900/20">
              Contact Us Now
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
