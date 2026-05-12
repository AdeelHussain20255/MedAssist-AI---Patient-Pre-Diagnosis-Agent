import { describe, test, expect } from 'vitest';
import { detectRedFlags, performLocalTriage } from '../lib/triage-engine';

describe('Triage Engine Safety Tests', () => {
  
  test('Detects English Red Flags (Chest Pain)', () => {
    const { matches, isMentalHealth } = detectRedFlags("I have severe chest pain and can't breathe");
    expect(matches).toContain('Chest pain/pressure');
    expect(isMentalHealth).toBe(false);
  });

  test('Detects Urdu Red Flags (Unconscious)', () => {
    const { matches } = detectRedFlags("وہ بے ہوش ہو گیا ہے");
    expect(matches).toContain('Unconscious (Urdu)');
  });

  test('Detects Mental Health Emergency', () => {
    const { matches, isMentalHealth } = detectRedFlags("I want to hurt myself");
    expect(matches).toContain('Self-harm intent');
    expect(isMentalHealth).toBe(true);
  });

  test('Rule Engine: High Severity + Red Flag = CRITICAL', () => {
    const result = performLocalTriage({
      primarySymptom: "Chest pain",
      severity: 9,
      additionalSymptoms: ["shortness of breath"],
      conversationLog: "",
      language: "en",
      duration: "1 hour",
      medicalHistory: ""
    });
    expect(result.level).toBe('CRITICAL');
    expect(result.redFlagTriggered).toBe(true);
  });

  test('Rule Engine: Low Severity = MILD', () => {
    const result = performLocalTriage({
      primarySymptom: "Slight headache",
      severity: 2,
      additionalSymptoms: [],
      conversationLog: "",
      language: "en",
      duration: "2 days",
      medicalHistory: ""
    });
    expect(result.level).toBe('MILD');
  });

  test('Rule Engine: Urgent symptoms escalate to URGENT', () => {
    const result = performLocalTriage({
      primarySymptom: "High fever",
      severity: 7,
      additionalSymptoms: ["persistent cough"],
      conversationLog: "",
      language: "en",
      duration: "3 days",
      medicalHistory: ""
    });
    expect(result.level).toBe('URGENT');
  });

  test('Rule Engine: Handles empty symptoms gracefully', () => {
    const result = performLocalTriage({
      primarySymptom: "",
      severity: 5,
      additionalSymptoms: [],
      conversationLog: "",
      language: "en",
      duration: "",
      medicalHistory: ""
    });
    expect(result.level).toBe('MILD'); // Default for unknown/empty
  });

  test('Rule Engine: Urdu language support (Mild case)', () => {
    const result = performLocalTriage({
      primarySymptom: "ہلکا سر درد",
      severity: 3,
      additionalSymptoms: [],
      conversationLog: "",
      language: "ur",
      duration: "ایک دن",
      medicalHistory: ""
    });
    expect(result.level).toBe('MILD');
  });

  test('Safety: Multiple Red Flags always result in CRITICAL', () => {
    const result = performLocalTriage({
      primarySymptom: "Chest pain",
      severity: 4, // Even with low self-reported severity
      additionalSymptoms: ["difficulty breathing", "confusion"],
      conversationLog: "",
      language: "en",
      duration: "10 mins",
      medicalHistory: ""
    });
    expect(result.level).toBe('CRITICAL');
  });

});
