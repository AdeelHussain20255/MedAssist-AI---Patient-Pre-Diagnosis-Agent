import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/gemini';
import { detectRiskFlags, calculateDeterministicTriage } from '@/lib/triage-engine';
import { ChatMessageSchema } from '@/lib/validations';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';
import { getConversationHistory, saveConversationMessage } from '@/lib/chat-service';

import { auth } from '@clerk/nextjs/server';
import { createAuditLog, logJailbreakAttempt } from '@/lib/audit-service';

const JAILBREAK_PATTERNS = [
  /ignore\s+(previous|all)\s+instructions/i,
  /system\s+prompt/i,
  /you\s+are\s+now/i,
  /DAN/i,
  /jailbreak/i,
  /override/i,
];

export async function POST(request: Request) {
  const startTime = Date.now();
  const { userId } = await auth();

  try {
    const ip = getClientIP(request);
    
    // 1. Rate Limiting: Chat Messages
    const { success: msgSuccess, retryAfter: msgRetry } = await checkRateLimit(
      userId || ip, 
      RATE_LIMITS.CHAT_MESSAGES
    );
    
    if (!msgSuccess) {
      logger.warn('Rate limit exceeded: CHAT_MESSAGES', { userId, ip });
      return NextResponse.json(
        { error: 'Too many messages. Please wait a moment.' },
        { status: 429, headers: { 'Retry-After': msgRetry.toString() } }
      );
    }

    // 2. Parse and Validate Input
    const body = await request.json();
    const result = ChatMessageSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    const { message, sessionId, language } = result.data;

    // 3. Jailbreak Detection
    for (const pattern of JAILBREAK_PATTERNS) {
      if (pattern.test(message)) {
        await logJailbreakAttempt(userId || undefined, sessionId, pattern.toString(), message);
        return NextResponse.json(
          { error: 'Inappropriate content or attempt detected.' },
          { status: 400 }
        );
      }
    }

    // 4. Stage 1: Detection (Local Regex Safety)
    const { flags: localFlags, isMentalHealth } = detectRiskFlags(message);

    // 5. Generate AI Data Extraction (Stage 2 & 3)
    const history = sessionId ? await getConversationHistory(sessionId) : [];
    const aiResult = await generateChatResponse(history, message, language);

    // 6. Stage 4: Deterministic Decision Engine (Backend Authority)
    const { content: aiResponse, decision: aiDecision, severity, confirmedSymptoms } = aiResult;
    
    // Calculate deterministic result from extracted symptoms + regex safety
    const { level: finalLevelResult } = calculateDeterministicTriage(confirmedSymptoms, severity, localFlags);
    
    // Safety Rule: If AI is 100% sure it's CRITICAL, respect it, otherwise trust backend
    const finalLevel = aiDecision === 'CRITICAL' ? 'CRITICAL' : finalLevelResult;

    // 7. Persistence
    if (sessionId) {
      await saveConversationMessage(sessionId, message, aiResponse, language, {
        riskFlags: Array.from(new Set([...localFlags, ...aiResult.riskFlags])),
        severity: severity || undefined,
        symptoms: confirmedSymptoms
      });
    }

    // 8. Handle Critical Redirect based on Backend Authority
    if (finalLevel === 'CRITICAL') {
      logger.critical('Final Decision: CRITICAL Triage reached', { sessionId, localFlags, confirmedSymptoms });
      
      await createAuditLog({
        action: 'EMERGENCY_DETECTED',
        performedBy: 'HYBRID_ENGINE',
        userId: userId || undefined,
        sessionId,
        urgencyLevel: 'CRITICAL',
        details: { localFlags, confirmedSymptoms, aiDecision, message },
      });

      return NextResponse.json({
        type: 'critical_redirect',
        reason: 'Hybrid Engine: Critical severity confirmed',
        matches: Array.from(new Set([...localFlags, ...confirmedSymptoms])),
        isMentalHealth
      });
    }

    const duration = Date.now() - startTime;
    logger.info('Chat response generated', { 
      sessionId, 
      durationMs: duration,
      finalLevel,
      aiDecision
    });

    return NextResponse.json({
      type: 'message',
      content: aiResponse,
      role: 'model'
    });

  } catch (error) {
    logger.error('Chat API error', error, {
      userId,
      requestId: request.headers.get('x-request-id')
    });
    return NextResponse.json(
      { error: 'Something went wrong. Please try again later.' },
      { status: 500 }
    );
  }
}
