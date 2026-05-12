import { NextResponse } from 'next/server';
import { generateChatResponse } from '@/lib/gemini';
import { detectRedFlags } from '@/lib/triage-engine';
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

    // 4. Safety Check: Red Flags & Emergency Rate Limit
    const { matches, isMentalHealth } = detectRedFlags(message);
    if (matches.length > 0) {
      // Emergency alert rate limit
      const { success: alertSuccess } = await checkRateLimit(
        userId || ip,
        RATE_LIMITS.EMERGENCY_ALERTS
      );

      if (!alertSuccess) {
        logger.warn('Rate limit exceeded: EMERGENCY_ALERTS', { userId, ip });
        // We still allow it but maybe flag it in audit
      }

      logger.critical('Emergency Red Flag Detected', { sessionId, matches, isMentalHealth });
      
      await createAuditLog({
        action: 'EMERGENCY_DETECTED',
        performedBy: 'SYSTEM',
        userId: userId || undefined,
        sessionId,
        urgencyLevel: 'CRITICAL',
        details: { matches, message },
        symptomsReported: matches,
      });

      return NextResponse.json({
        type: 'critical_redirect',
        reason: 'Red flag detected',
        matches,
        isMentalHealth
      });
    }

    // 5. Generate AI Response using history
    const history = sessionId ? await getConversationHistory(sessionId) : [];
    const aiResponse = await generateChatResponse(history, message, language);

    // 6. Persistence
    if (sessionId) {
      await saveConversationMessage(sessionId, message, aiResponse, language);
    }

    const duration = Date.now() - startTime;
    logger.info('Chat response generated', { 
      sessionId, 
      durationMs: duration,
      msgLength: message.length 
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
