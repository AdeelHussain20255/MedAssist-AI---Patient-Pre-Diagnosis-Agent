import { prisma } from './prisma';
import { performLocalTriage, TriageResult } from './triage-engine';
import { getAITriageClassification } from './gemini';
import { logger } from './logger';
import { createAuditLog } from './audit-service';

interface TriageParams {
  sessionId: string;
  primarySymptom: string;
  additionalSymptoms: string[];
  severity: number;
}

/**
 * Executes the full triage flow: Local Rules -> AI Escalation -> Persistence
 */
export async function processTriage(params: TriageParams): Promise<TriageResult & { homeCareAdvice: string }> {
  const { sessionId, primarySymptom, additionalSymptoms, severity } = params;

  // 1. Get Session for context
  const session = await prisma.patientSession.findUnique({
    where: { id: sessionId },
    select: { conversationLog: true, language: true }
  });

  if (!session) throw new Error('Session not found');

  // 2. Perform Local Triage (Red Flags & Safety Rules)
  const localResult = performLocalTriage({
    primarySymptom,
    duration: '',
    severity,
    additionalSymptoms,
    medicalHistory: '',
    conversationLog: session.conversationLog || '',
    language: session.language as 'en' | 'ur'
  });

  let finalTriage = localResult;
  let homeCareAdvice = "";

  // 3. AI Escalation (Only if not already critical)
  if (localResult.level !== 'CRITICAL') {
    const aiResult = await getAITriageClassification(
      session.conversationLog || '',
      `${primarySymptom}. Additional: ${additionalSymptoms.join(', ')}`,
      severity
    );

    // Conservative Escalation: Higher severity wins
    const scores = { MILD: 1, URGENT: 2, CRITICAL: 3 };
    if (scores[aiResult.level] > scores[localResult.level]) {
      finalTriage = {
        ...localResult,
        level: aiResult.level,
        confidence: aiResult.confidence,
        reasoning: aiResult.reasoning,
        source: 'AI'
      };
    }
    homeCareAdvice = aiResult.homeCareAdvice;
  }

  // 4. Persistence & Audit
  const auditDetails = {
    ...finalTriage,
    homeCareAdvice
  };

  await prisma.patientSession.update({
    where: { id: sessionId },
    data: {
      triageLevel: finalTriage.level,
      triageConfidence: finalTriage.confidence,
      triageReasoning: finalTriage.reasoning,
      triageSource: finalTriage.source,
      redFlagTriggered: finalTriage.redFlagTriggered,
      redFlagMatches: finalTriage.redFlagMatches,
      status: finalTriage.level === 'CRITICAL' ? 'REDIRECTED_EMERGENCY' : 'TRIAGE_COMPLETE',
    }
  });

  await createAuditLog({
    action: 'TRIAGE_COMPLETED',
    performedBy: finalTriage.source,
    sessionId,
    urgencyLevel: finalTriage.level,
    details: auditDetails,
    symptomsReported: [primarySymptom, ...additionalSymptoms],
    clinicNotified: finalTriage.level === 'CRITICAL'
  });

  return { ...finalTriage, homeCareAdvice };
}
