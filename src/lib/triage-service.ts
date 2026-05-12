import { prisma } from './prisma';
import { detectRiskFlags, calculateDeterministicTriage, normalizeSymptoms, TriageResult, TriageLevel } from './triage-engine';
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
    select: { conversationLog: true, language: true, symptoms: true, severity: true, redFlagMatches: true }
  });

  if (!session) throw new Error('Session not found');

  // Merge current params with stored session data
  const storedSymptoms = session.symptoms ? session.symptoms.split(', ') : [];
  const rawSymptoms = Array.from(new Set([...additionalSymptoms, ...storedSymptoms]));
  
  // Hardening: Strict Symptom Normalization
  const allSymptoms = normalizeSymptoms(rawSymptoms);
  
  const finalSeverity = Math.max(severity, session.severity || 0);

  // 2. Perform Local Triage (Detection & Deterministic Engine)
  const { flags: localFlags } = detectRiskFlags(`${primarySymptom} ${allSymptoms.join(' ')}`);
  const combinedFlags = Array.from(new Set([...localFlags, ...(session.redFlagMatches || [])]));
  
  const deterministicResult = calculateDeterministicTriage(allSymptoms, finalSeverity, combinedFlags);

  let finalTriage: TriageResult = {
    level: deterministicResult.level,
    confidence: 1.0, 
    reasoning: deterministicResult.reasoning,
    riskFlags: localFlags,
    requiresMentalHealthResources: localFlags.includes('mental_health_potential'),
    source: 'RULE_ENGINE'
  };
  let homeCareAdvice = "";

  // 3. AI Escalation (Only if not already critical)
  if (finalTriage.level !== 'CRITICAL') {
    const aiResult = await getAITriageClassification(
      session.conversationLog || '',
      `${primarySymptom}. Additional: ${allSymptoms.join(', ')}`,
      finalSeverity
    );

    // Hardening: Only escalate if AI succeeded and suggested higher severity
    if (aiResult.status === 'SUCCESS') {
      const scores: Record<TriageLevel, number> = { MILD: 1, URGENT: 2, CRITICAL: 3 };
      if (scores[aiResult.level] > scores[finalTriage.level]) {
        finalTriage = {
          ...finalTriage,
          level: aiResult.level,
          confidence: aiResult.confidence,
          reasoning: `${finalTriage.reasoning} | AI Escalation: ${aiResult.reasoning}`,
          source: 'AI'
        };
      }
      homeCareAdvice = aiResult.homeCareAdvice;
    } else {
      // AI Fallback handling: Trust Rule Engine but flag it
      finalTriage.reasoning += " (AI Classification Unavailable - Using Rule Engine Safety)";
      logger.warn('Triage AI fallback triggered', { sessionId });
    }
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
      redFlagTriggered: finalTriage.riskFlags.length > 0,
      redFlagMatches: finalTriage.riskFlags,
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
