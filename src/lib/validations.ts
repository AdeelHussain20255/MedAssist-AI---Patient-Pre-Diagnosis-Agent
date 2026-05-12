/**
 * Zod Validation Schemas — Server-side mandatory, client-side for UX
 * All API inputs MUST be validated against these schemas.
 */

import { z } from 'zod';

/** Chat message from patient */
export const ChatMessageSchema = z.object({
  message: z
    .string()
    .min(1, 'Message cannot be empty')
    .max(2000, 'Message too long (max 2000 characters)'),
  sessionId: z.string().uuid().optional(),
  language: z.enum(['en', 'ur']).default('en'),
});

/** Patient consent */
export const ConsentSchema = z.object({
  consentGiven: z.literal(true, {
    message: 'You must agree to the terms to continue',
  }),
  language: z.enum(['en', 'ur']).default('en'),
});

/** Appointment booking */
export const BookingSchema = z.object({
  sessionId: z.string().uuid(),
  slotId: z.string().uuid(),
  patientName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name too long'),
  patientEmail: z
    .string()
    .email('Please enter a valid email address'),
  patientPhone: z
    .string()
    .regex(/^(\+92|0)?3[0-9]{9}$/, 'Please enter a valid Pakistan phone number')
    .optional(),
});

/** Appointment cancellation */
export const CancellationSchema = z.object({
  token: z.string().min(32).max(64),
  reason: z.string().max(500).optional(),
});

/** Appointment reschedule */
export const RescheduleSchema = z.object({
  token: z.string().min(32).max(64),
  newSlotId: z.string().uuid(),
});

/** Admin triage override */
export const TriageOverrideSchema = z.object({
  sessionId: z.string().uuid(),
  newLevel: z.enum(['MILD', 'URGENT', 'CRITICAL']),
  reason: z
    .string()
    .min(10, 'Please provide a detailed reason for the override')
    .max(500),
});

/** Contact form */
export const ContactFormSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  subject: z.string().min(5).max(200),
  message: z.string().min(10).max(2000),
});

/** Session demographics (optional collection) */
export const DemographicsSchema = z.object({
  age: z.number().int().min(0).max(150).optional(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type Consent = z.infer<typeof ConsentSchema>;
export type Booking = z.infer<typeof BookingSchema>;
export type Cancellation = z.infer<typeof CancellationSchema>;
export type Reschedule = z.infer<typeof RescheduleSchema>;
export type TriageOverride = z.infer<typeof TriageOverrideSchema>;
export type ContactForm = z.infer<typeof ContactFormSchema>;
export type Demographics = z.infer<typeof DemographicsSchema>;
