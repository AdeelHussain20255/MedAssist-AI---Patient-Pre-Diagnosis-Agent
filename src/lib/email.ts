/**
 * Nodemailer Email Client
 * 
 * Supports: Brevo SMTP (free: 300/day) or Gmail SMTP
 * Features: HTML + plaintext templates, retry with exponential backoff,
 * bounce/failure logging, English + Urdu support
 */

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/**
 * Send email with retry logic (3 attempts, exponential backoff)
 */
export async function sendWithRetry(options: EmailOptions, maxRetries = 3): Promise<boolean> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"MedAssist AI" <noreply@medassist.pk>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
      return true;
    } catch (error) {
      console.error(`[Email] Attempt ${attempt}/${maxRetries} failed:`, error);
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }
  return false;
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(data: {
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  providerName: string;
  triageLevel: string;
  cancellationToken: string;
  language: 'en' | 'ur';
}): Promise<boolean> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const manageUrl = `${appUrl}/manage?token=${data.cancellationToken}`;

  const isUrdu = data.language === 'ur';

  const subject = isUrdu
    ? `✅ آپ کی ملاقات کی تصدیق - ${data.appointmentDate}`
    : `✅ Appointment Confirmed - ${data.appointmentDate}`;

  const html = `
<!DOCTYPE html>
<html dir="${isUrdu ? 'rtl' : 'ltr'}" lang="${data.language}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="font-family: ${isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Inter', Arial, sans-serif"}; margin: 0; padding: 20px; background: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 32px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">
        ${isUrdu ? '🏥 MedAssist AI' : '🏥 MedAssist AI'}
      </h1>
      <p style="color: #dbeafe; margin: 8px 0 0; font-size: 14px;">
        ${isUrdu ? 'آپ کی ملاقات کی تصدیق ہو گئی ہے' : 'Your appointment has been confirmed'}
      </p>
    </div>
    <div style="padding: 32px;">
      <p style="font-size: 16px; color: #334155;">
        ${isUrdu ? `السلام علیکم ${data.patientName},` : `Hello ${data.patientName},`}
      </p>
      <p style="color: #475569;">
        ${isUrdu
          ? 'آپ کی ملاقات کامیابی سے بُک ہو گئی ہے۔ تفصیلات درج ذیل ہیں:'
          : 'Your appointment has been successfully booked. Here are the details:'}
      </p>
      <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: 8px; padding: 20px; margin: 20px 0;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">
              ${isUrdu ? '📅 تاریخ' : '📅 Date'}
            </td>
            <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">
              ${data.appointmentDate}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">
              ${isUrdu ? '🕐 وقت' : '🕐 Time'}
            </td>
            <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">
              ${data.appointmentTime}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #64748b; font-size: 14px;">
              ${isUrdu ? '👨‍⚕️ ڈاکٹر' : '👨‍⚕️ Provider'}
            </td>
            <td style="padding: 8px 0; font-weight: 600; color: #0f172a;">
              ${data.providerName}
            </td>
          </tr>
        </table>
      </div>
      <div style="text-align: center; margin: 24px 0;">
        <a href="${manageUrl}" 
           style="display: inline-block; background: #3b82f6; color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          ${isUrdu ? 'ملاقات منسوخ / دوبارہ شیڈول کریں' : 'Cancel / Reschedule Appointment'}
        </a>
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        ${isUrdu
          ? '⚠️ یہ ٹول صرف ابتدائی جانچ میں مدد کرتا ہے اور تشخیصی ٹول نہیں ہے۔ ایمرجنسی میں 1122 پر کال کریں۔'
          : '⚠️ This tool assists in pre-screening only and is NOT a diagnostic tool. In emergency, call 1122.'}
      </p>
    </div>
  </div>
</body>
</html>`;

  const text = isUrdu
    ? `MedAssist AI - ملاقات کی تصدیق\n\n${data.patientName},\n\nتاریخ: ${data.appointmentDate}\nوقت: ${data.appointmentTime}\nڈاکٹر: ${data.providerName}\n\nمنسوخ/دوبارہ شیڈول: ${manageUrl}`
    : `MedAssist AI - Appointment Confirmed\n\nHello ${data.patientName},\n\nDate: ${data.appointmentDate}\nTime: ${data.appointmentTime}\nProvider: ${data.providerName}\n\nCancel/Reschedule: ${manageUrl}`;

  return sendWithRetry({ to: data.patientEmail, subject, html, text });
}

/**
 * Send appointment reminder email
 */
export async function sendReminder(data: {
  patientName: string;
  patientEmail: string;
  appointmentDate: string;
  appointmentTime: string;
  providerName: string;
  hoursUntil: number;
  language: 'en' | 'ur';
}): Promise<boolean> {
  const isUrdu = data.language === 'ur';
  
  const subject = isUrdu
    ? `⏰ ملاقات کی یاددہانی - ${data.hoursUntil} گھنٹے باقی`
    : `⏰ Appointment Reminder - ${data.hoursUntil} hour${data.hoursUntil > 1 ? 's' : ''} away`;

  const html = `
<!DOCTYPE html>
<html dir="${isUrdu ? 'rtl' : 'ltr'}" lang="${data.language}">
<head><meta charset="utf-8"></head>
<body style="font-family: ${isUrdu ? "'Noto Nastaliq Urdu', serif" : "'Inter', Arial, sans-serif"}; margin: 0; padding: 20px; background: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <h2 style="color: #1e3a8a;">
      ${isUrdu ? `⏰ آپ کی ملاقات ${data.hoursUntil} گھنٹے میں ہے` : `⏰ Your appointment is in ${data.hoursUntil} hour${data.hoursUntil > 1 ? 's' : ''}`}
    </h2>
    <p>${isUrdu ? `${data.patientName}،` : `Hi ${data.patientName},`}</p>
    <p><strong>${isUrdu ? 'تاریخ:' : 'Date:'}</strong> ${data.appointmentDate}</p>
    <p><strong>${isUrdu ? 'وقت:' : 'Time:'}</strong> ${data.appointmentTime}</p>
    <p><strong>${isUrdu ? 'ڈاکٹر:' : 'Provider:'}</strong> ${data.providerName}</p>
  </div>
</body>
</html>`;

  const text = `${isUrdu ? 'یاددہانی' : 'Reminder'}: ${data.appointmentDate} ${data.appointmentTime} - ${data.providerName}`;

  return sendWithRetry({ to: data.patientEmail, subject, html, text });
}
