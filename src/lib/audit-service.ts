import { prisma } from './prisma';
import { logger } from './logger';

export interface AuditLogData {
  action: string;
  performedBy: string;
  userId?: string;
  sessionId?: string;
  details?: any;
  symptomsReported?: string[];
  urgencyLevel?: string;
  messagesExchanged?: number;
  jailbreakAttempts?: number;
  blockedPatterns?: string[];
  clinicNotified?: boolean;
  clinicId?: string;
}

/**
 * Audit Logging Service
 * Ensures all critical interactions are recorded in the DB.
 * 
 * SECURITY NOTE: To ensure true immutability, the database role used by Prisma
 * for this table should be restricted to INSERT only. Updates and Deletes should
 * be blocked at the database level via Row Level Security (RLS) or Role permissions.
 */
export async function createAuditLog(data: AuditLogData) {
  try {
    // 1. Save to Database
    const log = await prisma.auditLog.create({
      data: {
        action: data.action,
        performedBy: data.performedBy,
        userId: data.userId,
        sessionId: data.sessionId,
        details: data.details ? JSON.stringify(data.details) : null,
        symptomsReported: data.symptomsReported ? JSON.stringify(data.symptomsReported) : null,
        urgencyLevel: data.urgencyLevel,
        messagesExchanged: data.messagesExchanged,
        jailbreakAttempts: data.jailbreakAttempts || 0,
        blockedPatterns: data.blockedPatterns ? JSON.stringify(data.blockedPatterns) : null,
        clinicNotified: data.clinicNotified || false,
        clinicId: data.clinicId,
        notifiedAt: data.clinicNotified ? new Date() : null,
      }
    });

    // 2. Log to structured console (captured by Vercel/CloudWatch/Logtail)
    logger.info('Audit Log Entry Created', { 
      auditId: log.id,
      action: data.action,
      sessionId: data.sessionId 
    });

    return log;
  } catch (error) {
    // CRITICAL: If audit logging fails in a medical context, we must alert immediately.
    logger.critical('CRITICAL: Audit logging failed. This session may be unrecorded.', { error, data });
  }
}

/**
 * Log a suspected jailbreak attempt
 */
export async function logJailbreakAttempt(userId: string | undefined, sessionId: string | undefined, pattern: string, input: string) {
  await createAuditLog({
    action: 'JAILBREAK_ATTEMPT',
    performedBy: userId || 'ANONYMOUS',
    userId,
    sessionId,
    details: { input },
    blockedPatterns: [pattern],
    jailbreakAttempts: 1,
  });
  
  logger.warn('Jailbreak attempt detected and logged', { userId, sessionId, pattern });
}
