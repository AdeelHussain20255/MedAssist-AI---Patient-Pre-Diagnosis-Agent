"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ArrowRight, Shield, Clock, HeartPulse, Globe2, Sparkles, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const t = useTranslations("landing");

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6 }
  };

  return (
    <main className="flex-1 flex flex-col overflow-x-hidden">
      {/* Premium Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center pt-20 pb-16 px-4 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-slate-50 -z-10">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-100/50 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8 text-left"
          >
            <div className="inline-flex items-center gap-2 bg-brand-50 border border-brand-100 px-4 py-2 rounded-full text-brand-700 text-sm font-bold shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>{t("trustedBy")}</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] text-slate-900 tracking-tight">
              Smart <span className="text-brand-600 bg-clip-text text-transparent bg-gradient-to-r from-brand-600 to-blue-500">Pre-Screening</span> for Better Care
            </h1>
            
            <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
              Experience the future of healthcare with our AI triage engine. Get instant assessments and skip the waiting room.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link 
                href="/chat" 
                className="inline-flex items-center justify-center gap-2 bg-brand-600 text-white px-8 py-5 rounded-2xl font-bold text-xl transition-all hover:bg-brand-700 hover:scale-[1.02] shadow-xl shadow-brand-200 group"
              >
                {t("ctaButton")}
                <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/about" 
                className="inline-flex items-center justify-center px-8 py-5 rounded-2xl font-bold text-xl border-2 border-slate-200 text-slate-700 transition-all hover:bg-slate-50"
              >
                Learn More
              </Link>
            </div>

            <div className="flex items-center gap-6 pt-6 text-sm text-slate-400 font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                No Waiting
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                24/7 Available
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Clinical Grade
              </div>
            </div>
          </motion.div>

          {/* Hero Visual */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="bg-white p-6 rounded-[3rem] shadow-2xl border border-slate-100 relative z-20">
              <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <HeartPulse />
                  </div>
                  <div className="space-y-1">
                    <div className="w-32 h-3 bg-slate-200 rounded-full"></div>
                    <div className="w-20 h-2 bg-slate-100 rounded-full"></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-full h-2 bg-slate-100 rounded-full"></div>
                      <div className="w-2/3 h-2 bg-slate-50 rounded-full"></div>
                    </div>
                  </div>
                  <div className="p-4 bg-brand-600 rounded-2xl shadow-lg shadow-brand-100 flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-white/20"></div>
                    <div className="flex-1 space-y-2">
                      <div className="w-full h-2 bg-white/30 rounded-full"></div>
                      <div className="w-1/2 h-2 bg-white/20 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Decorative Orbs */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-brand-400/20 rounded-full blur-2xl animate-bounce-gentle"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl animate-pulse"></div>
          </motion.div>
        </div>
      </section>

      {/* Trust Bar */}
      <div className="bg-white border-y border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-8">
            Empowering Modern Clinics
          </p>
          <div className="flex flex-wrap justify-center items-center gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-2xl font-black text-slate-800">CLINIC+</span>
            <span className="text-2xl font-black text-slate-800">HEALTHCORE</span>
            <span className="text-2xl font-black text-slate-800">MEDFLOW</span>
            <span className="text-2xl font-black text-slate-800">SECURECARE</span>
          </div>
        </div>
      </div>

      {/* How It Works with Premium Design */}
      <section className="py-32 px-4 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <motion.div {...fadeInUp} className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
              Simplified <span className="text-brand-600">Patient Journey</span>
            </h2>
            <p className="text-lg text-slate-500">Three simple steps to getting the care you deserve faster than ever.</p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: <Globe2 className="w-8 h-8" />, title: t("step1Title"), desc: t("step1Desc"), color: "bg-blue-600" },
              { icon: <Sparkles className="w-8 h-8" />, title: t("step2Title"), desc: t("step2Desc"), color: "bg-brand-600" },
              { icon: <Clock className="w-8 h-8" />, title: t("step3Title"), desc: t("step3Desc"), color: "bg-slate-900" },
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="group relative p-10 rounded-[3rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500"
              >
                <div className={`w-16 h-16 rounded-2xl ${step.color} text-white flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 transition-transform`}>
                  {step.icon}
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-500 leading-relaxed">{step.desc}</p>
                <div className="absolute top-10 right-10 text-6xl font-black text-slate-100 -z-0">0{i+1}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-4 bg-slate-900 text-white rounded-[4rem] mx-4 mb-8 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-600/10 rounded-full blur-[120px] -z-0"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div {...fadeInUp} className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-black leading-tight tracking-tight">
                Clinically Driven <br />
                <span className="text-brand-400">Safety First</span> Logic
              </h2>
              <p className="text-xl text-slate-400 leading-relaxed max-w-lg">
                Our AI isn't just a chatbot. It's a precise triage engine built on rigorous medical protocols to ensure you're never in danger.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 pt-4">
                {[
                  { icon: <Shield />, title: t("feature3Title"), desc: t("feature3Desc") },
                  { icon: <HeartPulse />, title: t("feature2Title"), desc: t("feature2Desc") },
                ].map((f, i) => (
                  <div key={i} className="space-y-3">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-brand-400">
                      {f.icon}
                    </div>
                    <h4 className="font-bold text-lg">{f.title}</h4>
                    <p className="text-sm text-slate-500">{f.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-xl p-10 rounded-[3.5rem] border border-white/10 shadow-2xl"
            >
              <div className="space-y-10">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-400">Security & Privacy</span>
                    <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded-md">ENCRYPTED</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "100%" }}
                      transition={{ duration: 1.5 }}
                      className="h-full bg-brand-500"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-400">Triage Accuracy</span>
                    <span className="text-xs text-slate-500 px-2 py-1 bg-slate-800 rounded-md">CERTIFIED</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: "95%" }}
                      transition={{ duration: 1.5, delay: 0.2 }}
                      className="h-full bg-green-500"
                    />
                  </div>
                </div>

                <div className="pt-8 grid grid-cols-2 gap-4">
                  <div className="p-6 bg-white/5 rounded-3xl text-center">
                    <div className="text-3xl font-black text-brand-400">24/7</div>
                    <div className="text-xs text-slate-500 uppercase mt-2">Uptime</div>
                  </div>
                  <div className="p-6 bg-white/5 rounded-3xl text-center">
                    <div className="text-3xl font-black text-green-400">&lt;3m</div>
                    <div className="text-xs text-slate-500 uppercase mt-2">Average</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-4 text-center">
        <motion.div {...fadeInUp} className="max-w-4xl mx-auto space-y-10">
          <h2 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight">
            Ready for a <br />
            <span className="text-brand-600">Better Experience?</span>
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto">
            Join thousands of patients who have already streamlined their healthcare journey with MedAssist AI.
          </p>
          <div className="pt-6">
            <Link 
              href="/chat" 
              className="inline-flex items-center gap-3 bg-brand-600 text-white px-12 py-6 rounded-3xl font-black text-2xl transition-all hover:bg-brand-700 hover:scale-[1.05] shadow-2xl shadow-brand-200"
            >
              Start Chat Now
              <Sparkles className="w-6 h-6" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
