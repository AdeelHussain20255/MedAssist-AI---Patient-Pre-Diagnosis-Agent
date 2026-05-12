import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CancellationSchema } from '@/lib/validations';
import { checkRateLimit, RATE_LIMITS, getClientIP } from '@/lib/rate-limit';
import { sendWithRetry } from '@/lib/email'; // Need to export sendWithRetry or make a wrapper

export async function POST(request: Request) {
  try {
    const ip = getClientIP(request);
    const { success, retryAfter } = checkRateLimit(ip, RATE_LIMITS.GENERAL);
    if (!success) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });

    const body = await request.json();
    const result = CancellationSchema.safeParse(body);
    if (!result.success) return NextResponse.json({ error: 'Invalid data' }, { status: 400 });

    const { token, reason } = result.data;

    const appointment = await prisma.appointment.findUnique({
      where: { cancellationToken: token },
      include: { session: true }
    });

    if (!appointment) return NextResponse.json({ error: 'Invalid token' }, { status: 404 });
    if (appointment.status === 'CANCELLED') return NextResponse.json({ error: 'Already cancelled' }, { status: 400 });

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: { status: 'CANCELLED' }
    });

    await prisma.auditLog.create({
      data: {
        action: 'APPOINTMENT_CANCELLED',
        performedBy: 'PATIENT',
        sessionId: appointment.sessionId,
        details: JSON.stringify({ reason: reason || 'Patient requested cancellation' })
      }
    });

    // We can also send a cancellation confirmation email here (omitted for brevity in MVP)

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('[Cancel API Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
