/**
 * Triage Engine — Hard-coded red flag detection + severity classification
 * 
 * SAFETY-CRITICAL: Red flags ALWAYS run first, before any AI/LLM call.
 * If a red flag matches, classification is CRITICAL immediately.
 * Gemini CANNOT override hard-coded red flags.
 */

export type TriageLevel = 'MILD' | 'URGENT' | 'CRITICAL';

export interface TriageResult {
  level: TriageLevel;
  confidence: number;
  reasoning: string;
  redFlagTriggered: boolean;
  redFlagMatches: string[];
  requiresMentalHealthResources: boolean;
  source: 'RED_FLAG' | 'AI' | 'RULE_ENGINE';
}

export interface SymptomData {
  primarySymptom: string;
  duration: string;
  severity: number; // 1-10
  additionalSymptoms: string[];
  medicalHistory: string;
  conversationLog: string;
  language: 'en' | 'ur';
}

/**
 * Hard-coded red flag patterns — these ALWAYS trigger CRITICAL.
 * Includes English and Urdu patterns.
 * 
 * CRITICAL SAFETY: These are checked BEFORE any AI call.
 */
const RED_FLAGS: { pattern: RegExp; description: string; category: string }[] = [
  // Cardiac
  { pattern: /chest\s*(pain|pressure|tightness|heaviness|discomfort)/i, description: 'Chest pain/pressure', category: 'cardiac' },
  { pattern: /سینے\s*(میں\s*درد|کا\s*درد|میں\s*دباؤ)/i, description: 'Chest pain (Urdu)', category: 'cardiac' },
  { pattern: /heart\s*attack/i, description: 'Heart attack', category: 'cardiac' },
  { pattern: /دل\s*کا\s*دورہ/i, description: 'Heart attack (Urdu)', category: 'cardiac' },

  // Respiratory
  { pattern: /can('|')?t\s*breathe/i, description: 'Cannot breathe', category: 'respiratory' },
  { pattern: /difficulty\s*breathing/i, description: 'Difficulty breathing', category: 'respiratory' },
  { pattern: /shortness\s*of\s*breath/i, description: 'Shortness of breath', category: 'respiratory' },
  { pattern: /سانس\s*(نہیں|لینے\s*میں\s*مشکل)/i, description: 'Breathing difficulty (Urdu)', category: 'respiratory' },
  { pattern: /choking/i, description: 'Choking', category: 'respiratory' },

  // Stroke (FAST)
  { pattern: /face\s*(droop|drooping|numb)/i, description: 'Face drooping (stroke)', category: 'stroke' },
  { pattern: /arm\s*(weak|numb|can('|')?t\s*lift)/i, description: 'Arm weakness (stroke)', category: 'stroke' },
  { pattern: /speech\s*(difficulty|slurred|unclear)/i, description: 'Speech difficulty (stroke)', category: 'stroke' },
  { pattern: /sudden\s*(numbness|confusion|trouble\s*seeing)/i, description: 'Sudden neurological symptoms', category: 'stroke' },
  { pattern: /فالج/i, description: 'Stroke (Urdu)', category: 'stroke' },

  // Anaphylaxis
  { pattern: /throat\s*(swell|closing|tight)/i, description: 'Throat swelling (anaphylaxis)', category: 'anaphylaxis' },
  { pattern: /can('|')?t\s*swallow/i, description: 'Cannot swallow', category: 'anaphylaxis' },
  { pattern: /severe\s*allergic/i, description: 'Severe allergic reaction', category: 'anaphylaxis' },
  { pattern: /anaphyla/i, description: 'Anaphylaxis', category: 'anaphylaxis' },

  // Bleeding/Hemorrhage
  { pattern: /uncontrolled\s*bleed/i, description: 'Uncontrolled bleeding', category: 'bleeding' },
  { pattern: /hemorrhag/i, description: 'Hemorrhage', category: 'bleeding' },
  { pattern: /severe\s*bleed/i, description: 'Severe bleeding', category: 'bleeding' },
  { pattern: /خون\s*(بہہ|نہیں\s*رک)/i, description: 'Bleeding (Urdu)', category: 'bleeding' },

  // Consciousness
  { pattern: /loss\s*of\s*consciousness/i, description: 'Loss of consciousness', category: 'consciousness' },
  { pattern: /faint(ed|ing)/i, description: 'Fainting', category: 'consciousness' },
  { pattern: /passed\s*out/i, description: 'Passed out', category: 'consciousness' },
  { pattern: /unresponsive/i, description: 'Unresponsive', category: 'consciousness' },
  { pattern: /بے\s*ہوش/i, description: 'Unconscious (Urdu)', category: 'consciousness' },

  // Mental health crisis
  { pattern: /suicid/i, description: 'Suicidal ideation', category: 'mental_health' },
  { pattern: /(kill|hurt|harm)\s*(my)?self/i, description: 'Self-harm intent', category: 'mental_health' },
  { pattern: /want\s*to\s*die/i, description: 'Death wish', category: 'mental_health' },
  { pattern: /self[\s-]*harm/i, description: 'Self-harm', category: 'mental_health' },
  { pattern: /خودکشی/i, description: 'Suicide (Urdu)', category: 'mental_health' },
  { pattern: /مرنا\s*چاہ/i, description: 'Want to die (Urdu)', category: 'mental_health' },

  // Head injury
  { pattern: /head\s*injury.*?(confusion|vomit|unconscious)/i, description: 'Severe head injury', category: 'trauma' },
  { pattern: /سر\s*کی\s*چوٹ/i, description: 'Head injury (Urdu)', category: 'trauma' },

  // Seizure
  { pattern: /seizure/i, description: 'Seizure', category: 'seizure' },
  { pattern: /convuls/i, description: 'Convulsions', category: 'seizure' },
  { pattern: /مرگی\s*کا\s*دورہ/i, description: 'Seizure (Urdu)', category: 'seizure' },

  // Pregnancy emergencies
  { pattern: /pregnan(t|cy).*?(bleed|severe\s*(pain|abdominal))/i, description: 'Pregnancy emergency', category: 'obstetric' },
  { pattern: /حاملہ.*?(خون|شدید\s*درد)/i, description: 'Pregnancy emergency (Urdu)', category: 'obstetric' },

  // Infant fever
  { pattern: /(baby|infant|newborn|(<|under)\s*3\s*months?).*?fever/i, description: 'Infant fever (<3 months)', category: 'pediatric' },

  // Combined symptoms suggesting severe illness
  { pattern: /severe\s*(abdominal|stomach)\s*pain.*?(fever|vomit)/i, description: 'Acute abdomen (possible appendicitis/sepsis)', category: 'abdominal' },
];

/**
 * Check for hard-coded red flags in the patient's input.
 * This MUST run BEFORE any Gemini API call.
 * 
 * @param text - The full conversation text to scan
 * @returns Array of matched red flag descriptions
 */
export function detectRedFlags(text: string): { matches: string[]; isMentalHealth: boolean } {
  const matches: string[] = [];
  let isMentalHealth = false;

  for (const flag of RED_FLAGS) {
    if (flag.pattern.test(text)) {
      matches.push(flag.description);
      if (flag.category === 'mental_health') {
        isMentalHealth = true;
      }
    }
  }

  return { matches, isMentalHealth };
}

/**
 * Rule-based severity scoring for non-critical cases.
 * Used when no red flags are detected.
 */
export function calculateSeverityScore(data: SymptomData): { score: number; level: TriageLevel } {
  let score = 0;

  // Severity scale (1-10) contribution
  if (data.severity >= 8) score += 40;
  else if (data.severity >= 6) score += 25;
  else if (data.severity >= 4) score += 15;
  else score += 5;

  // Duration contribution
  const durationLower = data.duration.toLowerCase();
  if (durationLower.includes('week') || durationLower.includes('month')) score += 10;
  else if (durationLower.includes('day') && !durationLower.includes('1 day')) score += 15;
  else if (durationLower.includes('hour') || durationLower.includes('just started')) score += 20;

  // Number of symptoms
  if (data.additionalSymptoms.length >= 4) score += 20;
  else if (data.additionalSymptoms.length >= 2) score += 10;
  else score += 5;

  // Specific symptom keywords that suggest urgency
  const urgentKeywords = [
    /high\s*fever/i, /104|40\s*°?[cf]|39\s*°?c/i,
    /persistent\s*vomit/i, /can('|')?t\s*(eat|drink|keep)/i,
    /severe\s*pain/i, /fracture|broken\s*bone/i,
    /blood\s*in\s*(urine|stool|vomit)/i,
    /swelling.*?rapid/i, /rash.*?spread/i,
    /تیز\s*بخار/i, /شدید\s*درد/i,
  ];

  const fullText = `${data.primarySymptom} ${data.additionalSymptoms.join(' ')} ${data.conversationLog}`;
  for (const keyword of urgentKeywords) {
    if (keyword.test(fullText)) {
      score += 10;
    }
  }

  // Classify
  let level: TriageLevel;
  if (score >= 70) level = 'URGENT';
  else if (score >= 40) level = 'URGENT';
  else level = 'MILD';

  return { score: Math.min(score, 100), level };
}

/**
 * Main triage function — orchestrates red flag check + rule engine.
 * AI/Gemini integration is in a separate function (triageWithAI).
 * 
 * SAFETY: Red flags are checked FIRST and cannot be overridden.
 */
export function performLocalTriage(data: SymptomData): TriageResult {
  const fullText = `${data.primarySymptom} ${data.additionalSymptoms.join(' ')} ${data.conversationLog}`;

  // STEP 1: Hard-coded red flags (ALWAYS first)
  const { matches, isMentalHealth } = detectRedFlags(fullText);

  if (matches.length > 0) {
    return {
      level: 'CRITICAL',
      confidence: 1.0,
      reasoning: `Red flag detected: ${matches.join(', ')}. Immediate emergency services required.`,
      redFlagTriggered: true,
      redFlagMatches: matches,
      requiresMentalHealthResources: isMentalHealth,
      source: 'RED_FLAG',
    };
  }

  // STEP 2: Rule-based severity scoring
  const { score, level } = calculateSeverityScore(data);

  return {
    level,
    confidence: score / 100,
    reasoning: `Rule-based assessment: severity ${data.severity}/10, ${data.additionalSymptoms.length} additional symptoms, score ${score}/100.`,
    redFlagTriggered: false,
    redFlagMatches: [],
    requiresMentalHealthResources: false,
    source: 'RULE_ENGINE',
  };
}
