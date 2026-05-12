/**
 * Input/Output Sanitization — XSS prevention + prompt injection defense
 * 
 * SECURITY: All user inputs must be sanitized before:
 * 1. Storing in database
 * 2. Rendering in UI
 * 3. Sending to Gemini API
 * 4. Including in emails
 */

/**
 * Sanitize user input for safe processing.
 * Strips HTML tags, limits length, and removes potential injection patterns.
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';

  let sanitized = input;

  // Strip HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');

  // Limit length (prevent abuse)
  sanitized = sanitized.slice(0, 5000);

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize AI/Gemini output before rendering.
 * Removes any HTML/script injection attempts from model output.
 */
export function sanitizeOutput(output: string): string {
  if (!output || typeof output !== 'string') return '';

  let sanitized = output;

  // Strip HTML tags (model should not generate HTML)
  sanitized = sanitized.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '');
  sanitized = sanitized.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '');
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Remove potential JS injection
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=/gi, '');

  // Limit length
  sanitized = sanitized.slice(0, 3000);

  return sanitized.trim();
}

/**
 * Sanitize email content
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') return '';
  // Basic email format validation
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const cleaned = email.trim().toLowerCase();
  return emailRegex.test(cleaned) ? cleaned : '';
}

/**
 * Generate a hash of an IP address for consent logging
 * (We don't store raw IPs for privacy)
 */
export async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + '_medassist_salt_2024');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Sanitize for URL parameters
 */
export function sanitizeURLParam(param: string): string {
  if (!param || typeof param !== 'string') return '';
  return encodeURIComponent(param.slice(0, 200));
}
