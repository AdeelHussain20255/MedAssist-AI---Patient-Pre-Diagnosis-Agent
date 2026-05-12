import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReminder } from '@/lib/email';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}`) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Find appointments in exactly 1 hour (with a 15-min window)
    const now = new Date();
    const targetStart = new Date(now.getTime() + 60 * 60 * 1000);
    const targetEnd = new Date(now.getTime() + 75 * 60 * 1000);

    const appointments = await prisma.appointment.findMany({
      where: {
        status: 'CONFIRMED',
        scheduledFor: {
          gte: targetStart,
          lt: targetEnd,
        },
      },
      include: {
        session: {
          select: { language: true }
        }
      }
    });

    if (appointments.length === 0) {
      return NextResponse.json({ message: 'No 1h reminders to send' });
    }

    let sentCount = 0;
    const errors: string[] = [];

    for (const appt of appointments) {
      const existingLog = await prisma.emailLog.findFirst({
        where: {
          recipient: appt.patientEmail,
          type: 'REMINDER_1H',
          status: 'SENT',
          createdAt: {
            gte: new Date(now.getTime() - 2 * 60 * 60 * 1000) 
          }
        }
      });

      if (existingLog) continue;

      try {
        const dateStr = appt.scheduledFor.toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timeStr = appt.scheduledFor.toLocaleTimeString('en-PK', { hour: '2-digit', minute: '2-digit' });
        const language = (appt.session.language as 'en' | 'ur') || 'en';

        await sendReminder({
          patientName: appt.patientName,
          patientEmail: appt.patientEmail,
          appointmentDate: dateStr,
          appointmentTime: timeStr,
          providerName: appt.providerName,
          hoursUntil: 1,
          language
        });

        await prisma.emailLog.create({
          data: {
            recipient: appt.patientEmail,
            type: 'REMINDER_1H',
            status: 'SENT',
            sentAt: new Date()
          }
        });

        sentCount++;
      } catch (err) {
        errors.push(`Failed for ${appt.id}: ${err instanceof Error ? err.message : 'Unknown'}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: appointments.length,
      sent: sentCount,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('[Cron 1h Error]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
