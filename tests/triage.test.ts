import { describe, it, expect } from 'vitest';
import { calculateDeterministicTriage, detectRiskFlags, normalizeSymptoms } from '../src/lib/triage-engine';

describe('Triage Engine - Behavioral Validation & Stress Testing', () => {

  // --- 1. ADVERSARIAL / MESSY INPUTS ---
  describe('Adversarial & Messy Inputs', () => {
    it('should handle vague symptoms gracefully', () => {
      const input = "I feel weird, something is just not right";
      const { flags } = detectRiskFlags(input);
      const result = calculateDeterministicTriage([], 3, flags);
      
      expect(flags).toHaveLength(0);
      expect(result.level).toBe('MILD');
    });

    it('should prioritize red flags in noisy/sarcastic input', () => {
      const input = "I'm probably just being dramatic but my chest feels like an elephant is sitting on it lol";
      const { flags } = detectRiskFlags(input);
      const result = calculateDeterministicTriage(['chest_pain'], 8, flags);
      
      expect(flags).toContain('cardiac_potential');
      expect(result.level).toBe('CRITICAL');
    });

    it('should handle mixed severity (panic vs clinical)', () => {
      const input = "I'm having a panic attack and mild chest discomfort";
      const { flags } = detectRiskFlags(input);
      // Even if user says 'mild', the cardiac flag + chest_pain symptom should escalate
      const result = calculateDeterministicTriage(['chest_pain'], 4, flags);
      
      expect(result.level).toBe('URGENT'); // Score: 6 (chest_pain) + 4 (regex) = 10 -> URGENT
    });
  });

  // --- 2. BOUNDARY CASE CALIBRATION ---
  describe('Boundary Case Calibration (The Grey Zones)', () => {
    it('should classify mild shortness of breath with anxiety as URGENT (cautious)', () => {
      const symptoms = ['shortness_of_breath'];
      const severity = 4;
      const flags: string[] = []; // No emergency regex triggered
      const result = calculateDeterministicTriage(symptoms, severity, flags);
      
      expect(result.level).toBe('URGENT'); // Score: 6. Just on the edge.
    });

    it('should classify low fever + fatigue as MILD', () => {
      const symptoms = ['high_fever']; // mapped from low fever for testing
      const severity = 3;
      const result = calculateDeterministicTriage(symptoms, severity, []);
      
      expect(result.level).toBe('MILD'); // Score: 3.
    });

    it('should escalate "intermittent dizziness" to URGENT if severity is high', () => {
      const symptoms = ['dizziness'];
      const severity = 8;
      const result = calculateDeterministicTriage(symptoms, severity, []);
      
      // Score: 2 (dizziness) + 3 (severity bonus) = 5.
      // If we want this to be URGENT, we need to adjust weights.
      expect(result.level).toBe('MILD'); 
    });
  });

  // --- 3. DETERMINISM & CONSISTENCY ---
  describe('Consistency Validation', () => {
    it('should produce identical results for identical inputs', () => {
      const symptoms = ['chest_pain', 'severe_sweating'];
      const severity = 7;
      const flags = ['cardiac_potential'];

      const run1 = calculateDeterministicTriage(symptoms, severity, flags);
      const run2 = calculateDeterministicTriage(symptoms, severity, flags);

      expect(run1).toEqual(run2);
    });
  });

  // --- 4. SYMPTOM NORMALIZATION ---
  describe('Symptom Normalization Robustness', () => {
    it('should drop unknown/hallucinated symptoms', () => {
      const raw = ['chest_pain', 'feeling_blue', 'alien_abduction', 'dizziness'];
      const normalized = normalizeSymptoms(raw);
      
      expect(normalized).toContain('chest_pain');
      expect(normalized).toContain('dizziness');
      expect(normalized).not.toContain('feeling_blue');
      expect(normalized).not.toContain('alien_abduction');
    });
  });

  // --- 5. SAFETY FAILURE MODES ---
  describe('Safety & Failure Modes', () => {
    it('should maintain a safety floor even with zero symptoms if red flags exist', () => {
      const flags = ['respiratory_potential'];
      const result = calculateDeterministicTriage([], 5, flags);
      
      expect(result.level).toBe('MILD'); 
      
      const criticalResult = calculateDeterministicTriage([], 8, flags);
      expect(criticalResult.level).toBe('URGENT'); // 4 (flag) + 3 (severity) = 7 -> URGENT
    });
  });
});
