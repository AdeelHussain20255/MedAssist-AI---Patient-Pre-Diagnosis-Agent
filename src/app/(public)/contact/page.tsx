"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Phone, MapPin, Clock, MessageSquare, Send, CheckCircle2 } from "lucide-react";
import { ContactFormSchema, type ContactForm } from "@/lib/validations";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ContactPage() {
  const [isSubmitted, setIsSubmitted] = React.useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactForm>({
    resolver: zodResolver(ContactFormSchema),
  });

  const onSubmit = async (data: ContactForm) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Contact form submitted:", data);
    setIsSubmitted(true);
    reset();
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-white py-20 px-6 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-50 rounded-full blur-3xl -z-0"></div>
        <div className="max-w-4xl mx-auto text-center space-y-4 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
          >
            Get in <span className="text-brand-600">Touch</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500"
          >
            We're here to help you get the care you need.
          </motion.p>
        </div>
      </section>

      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-16">
          {/* Contact Info */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8 lg:col-span-1"
          >
            <div className="space-y-8">
              <h2 className="text-3xl font-black text-slate-900">Contact Details</h2>
              
              <div className="space-y-6">
                {[
                  { icon: <Phone />, title: "Phone", details: ["+92 (0) 51 123 4567", "Emergency: 1122"] },
                  { icon: <Mail />, title: "Email", details: ["info@medassist-ai.com", "support@medassist-ai.com"] },
                  { icon: <MapPin />, title: "Location", details: ["Blue Area, Islamabad", "Pakistan"] },
                  { icon: <Clock />, title: "Clinic Hours", details: ["Mon - Sat: 9:00 AM - 9:00 PM", "Sunday: Emergencies only"] },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="shrink-0 w-14 h-14 rounded-2xl bg-white border border-slate-100 text-brand-600 flex items-center justify-center shadow-sm group-hover:bg-brand-600 group-hover:text-white transition-all duration-300">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{item.title}</h4>
                      {item.details.map((d, j) => (
                        <p key={j} className="text-slate-500">{d}</p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.div 
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="space-y-8"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600">
                        <MessageSquare />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">Send us a message</h3>
                    </div>

                    <form className="grid md:grid-cols-2 gap-8" onSubmit={handleSubmit(onSubmit)}>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                        <Input 
                          {...register("name")}
                          error={errors.name?.message}
                          placeholder="Your Name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Email Address</label>
                        <Input 
                          {...register("email")}
                          type="email"
                          error={errors.email?.message}
                          placeholder="your@email.com"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Subject</label>
                        <Input 
                          {...register("subject")}
                          error={errors.subject?.message}
                          placeholder="How can we help?"
                        />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Message</label>
                        <textarea 
                          {...register("message")}
                          rows={5}
                          className={`w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none ${errors.message ? "ring-2 ring-red-500" : ""}`}
                          placeholder="Enter your message here..."
                        />
                        {errors.message && <p className="text-red-500 text-xs mt-1 ml-1 font-medium">{errors.message.message}</p>}
                      </div>
                      <Button 
                        type="submit"
                        variant="primary"
                        size="lg"
                        className="md:col-span-2 h-16 text-lg font-black shadow-xl shadow-brand-100"
                        isLoading={isSubmitting}
                      >
                        <Send className="w-5 h-5 mr-2" />
                        Send Message
                      </Button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-20 text-center space-y-6"
                  >
                    <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-3xl font-black text-slate-900">Message Sent!</h3>
                    <p className="text-slate-500 text-lg max-w-sm mx-auto">
                      Thank you for reaching out. Our team will get back to you shortly.
                    </p>
                    <Button 
                      variant="secondary" 
                      onClick={() => setIsSubmitted(false)}
                      className="mt-8"
                    >
                      Send Another Message
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
