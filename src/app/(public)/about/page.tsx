"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, ShieldCheck, Zap, UserPlus, HeartPulse, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";

export default function AboutPage() {
  const t = useTranslations("about");

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-slate-50 py-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-100/50 rounded-full blur-[100px] -z-0 translate-x-1/2 -translate-y-1/2"></div>
        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-full text-brand-700 text-sm font-bold shadow-sm"
          >
            <Star className="w-4 h-4 fill-brand-600 text-brand-600" />
            <span>Redefining Patient Access</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight"
          >
            Smart Triage for the <br />
            <span className="text-brand-600">Next Generation</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto"
          >
            MedAssist AI bridges the gap between symptoms and care. We're here to ensure every patient gets the right attention at the right time.
          </motion.p>
        </div>
      </section>

      {/* Steps Detail */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
          <div className="space-y-16">
            {[
              { 
                num: "01", 
                title: "Secure Consultation", 
                desc: "Your journey starts with a private, encrypted chat. Share your symptoms in English or Urdu—our AI understands the nuances of patient descriptions.",
                icon: <Shield className="w-6 h-6" />
              },
              { 
                num: "02", 
                title: "Real-time Triage", 
                desc: "Our engine analyzes your input against validated clinical protocols, instantly identifying urgency levels and detecting life-threatening red flags.",
                icon: <Zap className="w-6 h-6" />
              },
              { 
                num: "03", 
                title: "Prioritized Booking", 
                desc: "No more waiting for days. If your condition is urgent, we ensure you get the earliest possible slot, matching you with the right specialist immediately.",
                icon: <UserPlus className="w-6 h-6" />
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="flex gap-8 group"
              >
                <div className="shrink-0 space-y-4">
                  <div className="text-5xl font-black text-slate-100 group-hover:text-brand-100 transition-colors">{step.num}</div>
                  <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shadow-sm">
                    {step.icon}
                  </div>
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-black text-slate-900 group-hover:text-brand-600 transition-colors">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-lg">
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-slate-900 p-12 rounded-[4rem] shadow-2xl border border-white/10 space-y-10 relative z-10 text-white">
              <div className="space-y-6">
                <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-600/20">
                  <ShieldCheck size={32} />
                </div>
                <h4 className="text-3xl font-black">
                  Clinically <br />
                  <span className="text-brand-400">Validated</span> Logic
                </h4>
                <p className="text-slate-400 text-lg leading-relaxed">
                  Unlike general AI, MedAssist is built on strict medical decision trees. If the system is ever uncertain, it defaults to the safest possible recommendation.
                </p>
              </div>
              
              <ul className="space-y-6">
                {[
                  "Verified Red-Flag Detection",
                  "Bilingual Support (English & Urdu)",
                  "End-to-End Data Privacy"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="font-bold text-slate-200">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Decorative Orbs */}
            <div className="absolute -top-10 -right-10 w-64 h-64 bg-brand-600/20 rounded-full blur-[80px] -z-0"></div>
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-600/10 rounded-full blur-[100px] -z-0"></div>
          </motion.div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 bg-slate-50 border-y border-slate-100 px-6">
        <div className="max-w-4xl mx-auto text-center space-y-12">
          <motion.div {...fadeInUp} className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Why Digital Triage?</h2>
            <p className="text-xl text-slate-600 leading-relaxed">
              We believe healthcare should be proactive, not reactive. Digital triage allows clinics to manage patient flow efficiently while ensuring urgent cases never slip through the cracks.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 pt-12">
            {[
              { val: "95%", label: "Accuracy Rate" },
              { val: "< 3m", label: "Avg. Triage Time" },
              { val: "24/7", label: "Always Active" },
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100"
              >
                <div className="text-4xl font-black text-brand-600 mb-2">{stat.val}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <motion.div {...fadeInUp} className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-4xl font-black text-slate-900">Experience it yourself</h2>
          <p className="text-lg text-slate-500">Ready to see how MedAssist AI can transform your patient experience?</p>
          <div className="pt-4">
            <a href="/chat" className="inline-flex items-center justify-center bg-brand-600 text-white px-10 py-5 rounded-2xl font-black text-xl hover:bg-brand-700 transition-all shadow-xl shadow-brand-100">
              Start Free Pre-Screening
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
