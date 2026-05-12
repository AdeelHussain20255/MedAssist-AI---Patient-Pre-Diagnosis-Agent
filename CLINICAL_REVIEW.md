# Clinical Review Checklist - MedAssist AI

This document must be completed and signed by a licensed medical professional before the application is deployed for public use in Pakistan.

## 1. Red Flag Detection Review
- [ ] Review `src/lib/triage-engine.ts` (specifically `RED_FLAG_PATTERNS`).
- [ ] Confirm all life-threatening symptoms (Cardiac, Respiratory, Stroke, Severe Trauma) are covered.
- [ ] Confirm Urdu localized patterns (`RED_FLAG_PATTERNS_UR`) are clinically accurate.
- [ ] Verify that Red Flag detection correctly triggers the `CRITICAL` triage level.

## 2. Triage Logic & Thresholds
- [ ] Review the rule-based scoring system in `performLocalTriage`.
- [ ] Confirm the severity thresholds (1-10) correctly map to MILD, URGENT, and CRITICAL.
- [ ] Verify that the system defaults to `URGENT` or `CRITICAL` in cases of ambiguity.

## 3. AI System Prompt Review
- [ ] Review the system instructions in `src/lib/gemini.ts`.
- [ ] Confirm the AI is correctly instructed to NEVER diagnose or prescribe.
- [ ] Confirm the follow-up questions recommended by the AI are clinically relevant.
- [ ] Review the "Home Care Advice" guidelines for MILD cases to ensure they are safe (e.g., hydration, rest).

## 4. Legal & Disclaimer Review
- [ ] Review the displayed disclaimer in `src/components/chat/ConsentForm.tsx`.
- [ ] Confirm the Privacy Policy and Terms of Service correctly address medical liability.
- [ ] Verify the 1122 emergency redirect is functioning and prominent.

---

### Reviewer Information
- **Name**: ___________________________
- **License Number (PMC/PK)**: _______________
- **Date of Review**: ___________________
- **Signature**: _______________________
