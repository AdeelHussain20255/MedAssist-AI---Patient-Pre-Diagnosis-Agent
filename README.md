# MedAssist AI - Patient Pre-Diagnosis Agent

Production-grade, SEO-optimized, and security-hardened AI Patient Pre-Diagnosis Agent built with Next.js 15, Gemini AI, Supabase, and Clerk.

## 🚀 Key Features
- **AI Triage Engine**: Classifies symptoms into MILD, URGENT, or CRITICAL using Gemini 2.0 Flash.
- **Safety First**: Hard-coded red flag detection (English + Urdu) runs BEFORE any AI processing.
- **Emergency Redirect**: Instant 1122 Pakistan emergency redirect for critical cases.
- **Multilingual**: Full English and Urdu support with RTL-aware UI.
- **Admin Dashboard**: Real-time patient queue and triage override for clinic staff.
- **SEO Optimized**: SSR throughout, JSON-LD, Sitemap, and Robots.txt.
- **Secure**: OWASP-hardened, rate-limited, and RBAC via Clerk.

## 🛠 Tech Stack
- **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion
- **Backend**: Next.js Server Actions & API Routes
- **Database**: Supabase (Postgres) with Prisma ORM
- **AI**: Google Gemini 2.0 Flash API
- **Auth**: Clerk (RBAC)
- **Email**: Nodemailer + Brevo SMTP
- **Monitoring**: Sentry & PostHog

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18+ 
- Supabase Account (Free tier)
- Clerk Account (Free tier)
- Google AI Studio API Key (Gemini - Free tier)
- Brevo/SMTP credentials

### 2. Installation
```bash
git clone [repository-url]
cd patient-prediagnosis-agent
npm install
```

### 3. Environment Setup
Copy `.env.example` to `.env.local` and fill in your keys:
```bash
cp .env.example .env.local
```

### 4. Database Setup
```bash
npx prisma db push
```

### 5. Run Development Server
```bash
npm run dev
```

## 🔐 Security & Production Requirements (CRITICAL)

Before deploying to production (Vercel), you MUST configure the following:

1. **Distributed Rate Limiting (Redis)**:
   - This app uses `@upstash/ratelimit`. In-memory limiting will NOT work on Vercel.
   - Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`.
   
2. **Audit Log Integrity**:
   - The `AuditLog` table is your legal record. 
   - **Requirement**: Apply the following RLS policy in Supabase to ensure immutability:
   ```sql
   -- Enable RLS on AuditLog
   ALTER TABLE "AuditLog" ENABLE ROW LEVEL SECURITY;

   -- App user can only INSERT
   CREATE POLICY "audit_insert_only" ON "AuditLog"
   FOR INSERT TO authenticated WITH CHECK (true);

   -- No UPDATE/DELETE allowed (implied by omitting those policies)
   ```
   
3. **Sentry & Monitoring**:
   - Ensure `NEXT_PUBLIC_SENTRY_DSN` is set to track real-time clinical errors.

4. **Clinical Review**:
   - **MANDATORY**: Before launch, a qualified medical professional must review the triage logic in `src/lib/triage-engine.ts` and the AI system prompt in `src/lib/gemini.ts`.
   - See [CLINICAL_REVIEW.md](./CLINICAL_REVIEW.md) for the review checklist.

## 🏥 Medical Disclaimer

**IMPORTANT**: MedAssist AI is a pre-screening assistant and NOT a diagnostic tool. 
- It does not replace professional medical judgment.
- All triage classifications are preliminary and subject to clinical review.
- The system is designed to be **conservative** and will escalate urgency when uncertain.
- **In case of emergency, call 1122 immediately.**

## 📄 License
This project is for demonstration and must be medically certified before actual patient use.
