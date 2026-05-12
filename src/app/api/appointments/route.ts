import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { BookingSchema } from '@/lib/validations';
import { sendBookingConfirmation } from '@/lib/email';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { sanitizeInput, sanitizeEmail } from '@/lib/sanitize';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting (prevent spamming bookings)
    const ip = getClientIP(request);
    const { success, retryAfter } = await checkRateLimit(ip, RATE_LIMITS.GENERAL);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': retryAfter.toString() } });
    }

    // 2. Validate Input
    const body = await request.json();
    const result = BookingSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid booking data', details: result.error.issues }, { status: 400 });
    }

    const { sessionId, slotId, patientName, patientEmail, patientPhone } = result.data;

    // 3. Verify Session exists and has completed triage, NOT critical
    const session = await prisma.patientSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.triageLevel === 'CRITICAL') {
      return NextResponse.json({ error: 'Critical cases cannot be booked. Call emergency services.' }, { status: 403 });
    }

    // 4. Mock Slot/Provider data (In a real app, query the provider schedule DB)
    // Here we generate a mock schedule based on the triage level.
    const scheduledDate = new Date();
    if (session.triageLevel === 'URGENT') {
      scheduledDate.setDate(scheduledDate.getDate() + 1); // Tomorrow
    } else {
      scheduledDate.setDate(scheduledDate.getDate() + 3); // 3 days from now
    }
    scheduledDate.setHours(10, 0, 0, 0);

    const providerName = 'Dr. Ahmed Khan (General Physician)';

    // 5. Create Appointment
    const appointment = await prisma.appointment.create({
      data: {
        sessionId,
        patientName: sanitizeInput(patientName),
        patientEmail: sanitizeEmail(patientEmail),
        patientPhone: sanitizeInput(patientPhone),
        scheduledFor: scheduledDate,
        providerId: 'mock-provider-1',
        providerName,
        status: 'CONFIRMED'
      }
    });

    // Update session status
    await prisma.patientSession.update({
      where: { id: sessionId },
      data: { status: 'BOOKED' }
    });

    // 6. Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'APPOINTMENT_BOOKED',
        performedBy: 'SYSTEM',
        sessionId: sessionId,
        details: JSON.stringify({ appointmentId: appointment.id })
      }
    });

    // 7. Send Email Confirmation
    const dateStr = scheduledDate.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const timeStr = scheduledDate.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
    const language = (session.language as 'en' | 'ur') || 'en';

    try {
      await sendBookingConfirmation({
        patientName: sanitizeInput(patientName),
        patientEmail: sanitizeEmail(patientEmail),
        appointmentDate: dateStr,
        appointmentTime: timeStr,
        providerName,
        triageLevel: session.triageLevel || 'MILD',
        cancellationToken: appointment.cancellationToken,
        language
      });
      
      // Log email sent
      await prisma.emailLog.create({
        data: {
          recipient: patientEmail,
          type: 'BOOKING_CONFIRMATION',
          status: 'SENT',
          sentAt: new Date()
        }
      });
    } catch (emailError) {
      console.error('[Email Send Error]', emailError);
      await prisma.emailLog.create({
        data: {
          recipient: patientEmail,
          type: 'BOOKING_CONFIRMATION',
          status: 'FAILED',
          error: emailError instanceof Error ? emailError.message : 'Unknown error'
        }
      });
      // We don't fail the booking if email fails, but we should handle it gracefully
    }

    return NextResponse.json({ 
      success: true, 
      appointmentId: appointment.id,
      date: dateStr,
      time: timeStr,
      provider: providerName
    });

  } catch (error) {
    console.error('[Booking API Error]', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
