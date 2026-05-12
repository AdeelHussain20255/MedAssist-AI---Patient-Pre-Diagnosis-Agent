import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TriageOverrideSchema } from '@/lib/validations';
import { requireClinicStaff } from '@/lib/clerk';

export async function POST(request: Request) {
  try {
    // 1. Authenticate & Authorize
    const userId = await requireClinicStaff();

    // 2. Validate Input
    const body = await request.json();
    const result = TriageOverrideSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: 'Invalid data', details: result.error.issues }, { status: 400 });
    }

    const { sessionId, newLevel, reason } = result.data;

    // 3. Get Session
    const session = await prisma.patientSession.findUnique({
      where: { id: sessionId }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // 4. Update Session Triage
    const previousLevel = session.triageLevel;
    
    await prisma.patientSession.update({
      where: { id: sessionId },
      data: { 
        triageLevel: newLevel,
        triageSource: 'MANUAL_OVERRIDE'
      }
    });

    // 5. Immutable Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'TRIAGE_OVERRIDE',
        performedBy: userId, // Log which staff member did this
        sessionId: sessionId,
        details: JSON.stringify({
          previousLevel,
          newLevel,
          reason,
          timestamp: new Date().toISOString()
        })
      }
    });

    return NextResponse.json({ success: true, newLevel });

  } catch (error) {
    console.error('[Admin Override API Error]', error);
    if (error instanceof Error && error.message.includes('Forbidden')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
