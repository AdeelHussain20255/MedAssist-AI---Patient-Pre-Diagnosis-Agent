# MedAssist AI - Patient Pre-Diagnosis Agent

Production-grade, SEO-optimized, and security-hardened AI Patient Pre-Diagnosis Agent built with **Next.js 16 (Turbopack)**, Gemini AI, Supabase, and Clerk.

## 🚀 Key Features
- **AI Triage Engine**: Classifies symptoms into MILD, URGENT, or CRITICAL using Gemini 2.0 Flash.
- **Safety First**: Hard-coded red flag detection (English + Urdu) runs BEFORE any AI processing.
- **Emergency Redirect**: Instant 1122 Pakistan emergency redirect for critical cases.
- **Distributed Rate Limiting**: Production-ready rate limiting using Upstash Redis.
- **Audit Log Integrity**: Implemented RLS policies for immutable clinical audit trails.
- **Multilingual**: Full English and Urdu support with RTL-aware UI.
- **Admin Dashboard**: Real-time patient queue and triage override for clinic staff.

## 🛠 Tech Stack
- **Frontend**: Next.js 16 (App Router / Turbopack)
- **Database**: Supabase (Postgres) with Prisma ORM
- **Rate Limiting**: Upstash Redis (@upstash/ratelimit)
- **AI**: Google Gemini 2.0 Flash
- **Auth**: Clerk (RBAC)
- **Email**: Nodemailer + SMTP (Brevo/Gmail)

## 📦 Getting Started

### 1. Installation
```bash
git clone https://github.com/AdeelHussain20255/MedAssist-AI---Patient-Pre-Diagnosis-Agent.git
cd patient-prediagnosis-agent
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and fill in:
- `DATABASE_URL` & `DIRECT_URL` (Supabase)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`
- `GEMINI_API_KEY`
- `UPSTASH_REDIS_REST_URL` & `UPSTASH_REDIS_REST_TOKEN`
- `NEXT_PUBLIC_APP_URL` (Your Vercel domain)
- `SMTP_*` (Host, Port, User, Pass)

### 3. Database & Build
```bash
npx prisma db push
npm run build
```

## 🔐 Production Configuration (Vercel)

### 1. Build Command Fix
To prevent Prisma initialization errors on Vercel, the build command is configured as:
`prisma generate && next build`

### 2. Audit Log Immutability (MANDATORY)
Run this SQL in your Supabase SQL Editor to ensure medical logs cannot be deleted:
```sql
ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_insert_only" ON "AuditLog"
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "audit_select_admin" ON "AuditLog"
FOR SELECT TO authenticated USING (true);
```

### 3. Cron Jobs
Vercel Hobby plan supports **one daily cron job**. The configuration is set to:
- Path: `/api/cron/reminders/24h`
- Schedule: `0 10 * * *` (Daily at 10 AM)

## 🏥 Medical Disclaimer
MedAssist AI is an **assistive triage tool** and NOT a diagnostic tool. 
- It does not replace professional medical judgment.
- All triage classifications are preliminary and based on programmed protocols.
- **In case of emergency, call 1122 immediately.**

## 📄 License
This project is for demonstration and must be medically certified before actual patient use.
