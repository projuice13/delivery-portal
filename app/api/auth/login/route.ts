export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/schema';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { password, rememberMe = false } = body;

  if (password !== process.env.LOGIN_PASSWORD) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Session regeneration: destroy then create fresh
  const oldSession = await getSession();
  await oldSession.destroy();

  const session = await getSession(rememberMe);
  session.userId = 'driver-session';
  await session.save();

  const ip = request.headers.get('x-forwarded-for') ?? '';
  db.insert(auditLogs)
    .values({
      id: crypto.randomUUID(),
      userId: 'driver-session',
      action: 'login',
      details: {},
      ipAddress: ip,
    })
    .catch(() => {});

  return NextResponse.json({ ok: true });
}
