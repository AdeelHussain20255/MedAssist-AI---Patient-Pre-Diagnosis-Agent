/**
 * Triage Engine — Deterministic Clinical Decision Engine
 * 
 * ARCHITECTURE:
 * 1. Symptom Detection: Regex-based risk flag tagging (no decisions).
 * 2. Symptom Normalization: Validate against fixed ontology.
 * 3. Deterministic Scoring: Weighted symptoms + syndrome multipliers.
 * 4. Decision Output: MILD / URGENT / CRITICAL with full reasoning trail.
 */

export type TriageLevel = 'MILD' | 'URGENT' | 'CRITICAL';

export interface TriageResult {
  level: TriageLevel;
  confidence: number;
  reasoning: string;
  riskFlags: string[];
  requiresMentalHealthResources: boolean;
  source: 'RED_FLAG' | 'AI' | 'RULE_ENGINE' | 'MANUAL_OVERRIDE';
}

/**
 * Risk Flag Patterns — used for Stage 1 (Detection) only.
 * These TAG the conversation but DO NOT trigger immediate redirects.
 */
export const RISK_FLAGS: { pattern: RegExp; description: string; category: string }[] = [
  // Cardiac
  { pattern: /chest.*(pain|pressure|tightness|heaviness|discomfort|sitting\s*on|squeezing|weight)/i, description: 'cardiac_potential', category: 'cardiac' },
  { pattern: /سینے\s*(میں\s*درد|کا\s*درد|میں\s*دباؤ|بوجھ)/i, description: 'cardiac_potential', category: 'cardiac' },
  
  // Respiratory
  { pattern: /can('|')?t\s*breathe|difficulty\s*breathing|shortness\s*of\s*breath/i, description: 'respiratory_potential', category: 'respiratory' },
  { pattern: /سانس\s*(نہیں|لینے\s*میں\s*مشکل)/i, description: 'respiratory_potential', category: 'respiratory' },

  // Stroke
  { pattern: /face\s*(droop|numb)|arm\s*(weak|numb)|speech\s*(slurred|difficulty)/i, description: 'neurological_potential', category: 'neurological' },
  { pattern: /فالج/i, description: 'neurological_potential', category: 'neurological' },

  // Anaphylaxis
  { pattern: /throat\s*(swell|closing|tight)|can('|')?t\s*swallow/i, description: 'allergic_potential', category: 'anaphylaxis' },

  // Mental Health
  { pattern: /suicid|(kill|hurt|harm)\s*(my)?self|want\s*to\s*die/i, description: 'mental_health_potential', category: 'mental_health' },
  { pattern: /خودکشی/i, description: 'mental_health_potential', category: 'mental_health' },
];

/**
 * Stage 1: Detection (NO DECISIONS HERE)
 * Simply identifies potential risk labels.
 */
export function detectRiskFlags(text: string): { flags: string[]; isMentalHealth: boolean } {
  const flags: string[] = [];
  let isMentalHealth = false;

  for (const flag of RISK_FLAGS) {
    if (flag.pattern.test(text)) {
      if (!flags.includes(flag.description)) {
        flags.push(flag.description);
      }
      if (flag.category === 'mental_health') {
        isMentalHealth = true;
      }
    }
  }

  return { flags, isMentalHealth };
}

/**
 * Stage 4: Advanced Deterministic Engine
 * 
 * Includes:
 * - Fixed Symptom Ontology (Allowed symptoms)
 * - Syndrome Multipliers (Non-linear combination scoring)
 * - Weighted Overrides (Regex flags add points, not just hard stops)
 */

export const ALLOWED_SYMPTOMS = [
  'chest_pain', 'shortness_of_breath', 'pain_radiating_to_arm', 'severe_sweating',
  'facial_droop', 'slurred_speech', 'one_sided_weakness',
  'difficulty_breathing_resting', 'wheezing', 'stridor',
  'high_fever', 'persistent_vomiting', 'severe_abdominal_pain', 'dizziness'
] as const;

export const SYMPTOM_SCORES: Record<string, number> = {
  'chest_pain': 6,
  'shortness_of_breath': 6,
  'pain_radiating_to_arm': 4,
  'severe_sweating': 3,
  'facial_droop': 10,
  'slurred_speech': 10,
  'one_sided_weakness': 10,
  'difficulty_breathing_resting': 8,
  'wheezing': 4,
  'stridor': 7,
  'high_fever': 3,
  'persistent_vomiting': 2,
  'severe_abdominal_pain': 4,
  'dizziness': 2
};

// SYNDROME PATTERNS: Combinations that are more dangerous than their sum
const SYNDROME_MULTIPLIERS: { symptoms: string[]; multiplier: number; label: string }[] = [
  { symptoms: ['chest_pain', 'severe_sweating', 'dizziness'], multiplier: 1.5, label: 'Possible Acute Cardiac Event' },
  { symptoms: ['chest_pain', 'shortness_of_breath'], multiplier: 1.3, label: 'Cardiorespiratory Distress' },
  { symptoms: ['high_fever', 'severe_abdominal_pain'], multiplier: 1.2, label: 'Possible Acute Abdomen' }
];

/**
 * Advanced Deterministic Triage Calculation
 */
export function calculateDeterministicTriage(
  extractedSymptoms: string[],
  userSeverity: number | null,
  regexFlags: string[] = []
): { level: TriageLevel; score: number; reasoning: string } {
  let score = 0;
  const activeSymptoms = extractedSymptoms.filter(s => ALLOWED_SYMPTOMS.includes(s as any));

  // 1. Base Scores
  activeSymptoms.forEach(s => {
    score += SYMPTOM_SCORES[s] || 0;
  });

  // 2. Syndrome Multipliers (Non-linear)
  SYNDROME_MULTIPLIERS.forEach(syndrome => {
    const hasAll = syndrome.symptoms.every(s => activeSymptoms.includes(s));
    if (hasAll) {
      score *= syndrome.multiplier;
    }
  });

  // 3. Weighted Regex Overrides (Instead of hard stops)
  if (regexFlags.length > 0) {
    score += 4; // Add weight for regex-detected red flags
  }

  // 4. Severity Factor
  if (userSeverity && userSeverity >= 8) score += 3;

  // 5. Final Decision
  let level: TriageLevel = 'MILD';
  if (score >= 12) level = 'CRITICAL';
  else if (score >= 6) level = 'URGENT';

  return {
    level,
    score: Math.round(score),
    reasoning: `Score: ${Math.round(score)}. Symptoms: [${activeSymptoms.join(', ')}]. Patterns: ${regexFlags.length > 0 ? 'Regex Detected' : 'None'}.`
  };
}

/**
 * Symptom Normalization
 * Validates extracted symptoms against the ALLOWED_SYMPTOMS list.
 */
export function normalizeSymptoms(symptoms: string[]): string[] {
  return symptoms
    .map(s => s.trim().toLowerCase())
    .filter(s => ALLOWED_SYMPTOMS.includes(s as any));
}
