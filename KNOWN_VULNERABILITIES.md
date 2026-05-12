# Known Vulnerabilities - MedAssist AI

This document tracks known security vulnerabilities that are currently accepted for MVP but must be resolved in future updates.

## 1. PostCSS - Moderate Severity
- **Vulnerability**: XSS via Unescaped `</style>` in CSS Stringify Output.
- **Advisory**: [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93)
- **Status**: Noted but safe for MVP. 
- **Impact**: Low. Risk of XSS if user-provided CSS is processed by PostCSS. Since all CSS is static/developer-authored, the current risk is negligible.
- **Fix**: Update `postcss` to 8.5.10 or higher. Note: This may require a breaking update to Next.js.

## 2. Next.js Powered-By Header
- **Status**: FIXED. `poweredByHeader: false` added to `next.config.ts`.

## 3. CSP - Unsafe-Eval
- **Status**: ACTIVE. `unsafe-eval` is enabled in `middleware.ts` for Clerk compatibility.
- **Action**: Monitor Clerk SDK updates to see if this requirement can be removed.
