import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { processTriage } from '@/lib/triage-service';

const TriageRequestSchema = z.object({
  sessionId: z.string().uuid(),
  severity: z.number().min(1).max(10).optional(),
  primarySymptom: z.string(),
  additionalSymptoms: z.array(z.string()).default([]),
});

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting
    const ip = getClientIP(request);
    const { success, retryAfter } = await checkRateLimit(ip, RATE_LIMITS.CHAT_SESSIONS);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429, headers: { 'Retry-After': retryAfter.toString() } }
      );
    }

    // 2. Validate Input
    const body = await request.json();
    const result = TriageRequestSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { sessionId, severity, primarySymptom, additionalSymptoms } = result.data;

    // 3. Process Triage (Logic moved to service)
    const triageResult = await processTriage({
      sessionId,
      primarySymptom,
      additionalSymptoms,
      severity: severity ?? 5
    });

    return NextResponse.json({
      level: triageResult.level,
      requiresMentalHealthResources: triageResult.requiresMentalHealthResources,
      homeCareAdvice: triageResult.homeCareAdvice,
    });

  } catch (error) {
    logger.error('Triage API error', error, {
      requestId: request.headers.get('x-request-id')
    });
    
    // Safety Fallback
    return NextResponse.json(
      { level: 'URGENT', error: 'Something went wrong. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
