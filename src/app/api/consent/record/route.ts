import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';
import { getClientIP, checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';
import { logger } from '@/lib/logger';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    const ip = getClientIP(request);
    
    // Rate Limiting
    const { success } = await checkRateLimit(ip, RATE_LIMITS.AUTH);
    if (!success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
    }

    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    const body = await request.json();
    const { privacyVersion, termsVersion } = body;

    if (!privacyVersion || !termsVersion) {
      return NextResponse.json({ error: 'Missing versions' }, { status: 400 });
    }

    const agreement = await prisma.userAgreement.create({
      data: {
        userId: userId || null,
        ipAddress: ip,
        userAgent,
        privacyPolicyVersion: privacyVersion,
        termsVersion: termsVersion,
      }
    });

    logger.info('User agreement recorded', { userId, ip, agreementId: agreement.id });

    return NextResponse.json({ success: true, id: agreement.id });
  } catch (error) {
    logger.error('Failed to record user agreement', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
