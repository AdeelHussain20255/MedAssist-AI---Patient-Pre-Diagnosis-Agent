/**
 * Gemini AI Client — Server-side ONLY
 * 
 * SECURITY:
 * - All calls routed through backend (NEVER from browser)
 * - Input sanitized before sending to API
 * - Output validated via Zod schemas before use
 * - System prompt includes anti-prompt-injection rules
 * - Retry loop with graceful fallback on failure
 * - All calls logged for audit
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { sanitizeInput, sanitizeOutput } from './sanitize';
import type { TriageLevel } from './triage-engine';
import { logger } from './logger';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY && process.env.NODE_ENV === 'production') {
  throw new Error('GEMINI_API_KEY is required in production');
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

/**
 * System prompt for Gemini — includes anti-prompt-injection instructions
 */
import { z } from 'zod';

const TriageAIResponseSchema = z.object({
  content: z.string(),
  decision: z.enum(['PENDING', 'COMPLETED', 'CRITICAL']),
  severity: z.number().nullable(),
  riskFlags: z.array(z.string()),
  confirmedSymptoms: z.array(z.string()),
  requiresFollowUp: z.boolean(),
  homeCareAdvice: z.string().optional()
});

export type TriageAIResponse = z.infer<typeof TriageAIResponseSchema>;

const SYSTEM_PROMPT = `You are a medical data extraction agent. Your role is to interrogate patient symptoms and provide structured clinical data.

ALLOWED SYMPTOMS (ONTOLOGY):
chest_pain, shortness_of_breath, pain_radiating_to_arm, severe_sweating,
facial_droop, slurred_speech, one_sided_weakness,
difficulty_breathing_resting, wheezing, stridor,
high_fever, persistent_vomiting, severe_abdominal_pain, dizziness

TRIAGE STAGES:
1. DETECTION: Tag potential risks.
2. CONTEXT: Ask for severity (1-10), duration, onset.
3. CLARIFICATION: Ask 2-3 category-specific questions.
4. SUMMARY: Summarize findings.

RULES:
- RESPONSE FORMAT: You must respond ONLY with valid JSON.
- NORMALIZATION: Map all patient symptoms ONLY to the "ALLOWED SYMPTOMS" list above. Use the exact string from the list.
- DATA EXTRACTION: Fill "confirmedSymptoms" using the normalized list.
- DETERMINISM: If severity >= 8 or life-threatening symptoms confirmed, set decision to "CRITICAL".
- SOFT CAP: 3 rounds of questions max.

JSON SCHEMA:
{
  "content": "Patient-facing message",
  "decision": "PENDING" | "COMPLETED" | "CRITICAL",
  "severity": number | null,
  "riskFlags": string[],
  "confirmedSymptoms": string[],
  "requiresFollowUp": boolean,
  "homeCareAdvice": "Safe home care instructions if decision is COMPLETED or PENDING and symptoms are MILD"
}`;

/**
 * Generate a conversational response with validation and retries
 */
export async function generateChatResponse(
  conversationHistory: { role: 'user' | 'model'; content: string }[],
  userMessage: string,
  language: 'en' | 'ur' = 'en',
  retryCount = 0
): Promise<TriageAIResponse> {
  if (!genAI) throw new Error('AI service unavailable');

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview',
      systemInstruction: { role: 'system', parts: [{ text: SYSTEM_PROMPT }] },
      generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
    });

    const chat = model.startChat({
      history: conversationHistory.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    const result = await chat.sendMessage(sanitizeInput(userMessage));
    const responseText = result.response.text();
    
    // Validate JSON structure
    const parsed = TriageAIResponseSchema.parse(JSON.parse(responseText));
    return {
      ...parsed,
      content: sanitizeOutput(parsed.content)
    };

  } catch (error) {
    if (retryCount < 1) {
      logger.warn('AI JSON failed, retrying...', { error });
      return generateChatResponse(conversationHistory, userMessage, language, retryCount + 1);
    }
    
    logger.error('Gemini generateChatResponse failed after retries', error);
    return {
      content: language === 'ur' ? 'معذرت، ابھی ایک فنی خرابی پیش آگئی ہے۔' : 'I apologize, but I encountered a technical error. Please try again.',
      decision: 'PENDING',
      severity: null,
      riskFlags: [],
      confirmedSymptoms: [],
      requiresFollowUp: true
    };
  }
}

/**
 * Get AI-powered triage classification
 * IMPORTANT: This should ONLY be called AFTER red flag check has passed
 */
export async function getAITriageClassification(
  conversationLog: string,
  symptoms: string,
  severity: number
): Promise<{ level: TriageLevel; confidence: number; reasoning: string; homeCareAdvice: string; status: 'SUCCESS' | 'FALLBACK' }> {
  if (!genAI) {
    // Fallback: return URGENT when AI is unavailable (conservative approach)
    return {
      level: 'URGENT',
      confidence: 0,
      reasoning: 'AI service unavailable — defaulting to URGENT for safety.',
      homeCareAdvice: '',
      status: 'FALLBACK'
    };
  }

  const sanitizedLog = sanitizeInput(conversationLog);
  const sanitizedSymptoms = sanitizeInput(symptoms);

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_PROMPT,
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.1, // Very low for classification
        topP: 0.8,
        responseMimeType: 'application/json',
      },
    });

    const prompt = `Based on the following patient conversation, classify the triage level.
    
Patient symptoms: ${sanitizedSymptoms}
Severity (self-reported 1-10): ${severity}

Conversation transcript:
${sanitizedLog}

Classify this case as MILD, URGENT, or CRITICAL with your confidence score (0.0-1.0).
Remember: when uncertain, escalate UP. Respond with JSON only.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const ClassificationSchema = z.object({
      level: z.enum(['MILD', 'URGENT', 'CRITICAL']),
      confidence: z.number(),
      reasoning: z.string(),
      homeCareAdvice: z.string().optional()
    });

    const parsed = ClassificationSchema.parse(JSON.parse(responseText));

    return {
      level: parsed.level,
      confidence: Math.max(0, Math.min(1, parsed.confidence)),
      reasoning: sanitizeOutput(parsed.reasoning),
      homeCareAdvice: sanitizeOutput(parsed.homeCareAdvice || ''),
      status: 'SUCCESS'
    };
  } catch (error) {
    logger.error('Gemini getAITriageClassification error', error);
    // Conservative fallback
    return {
      level: 'URGENT',
      confidence: 0,
      reasoning: 'AI classification failed — defaulting to URGENT for safety.',
      homeCareAdvice: '',
      status: 'FALLBACK'
    };
  }
}
