export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/schema';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { username, password, rememberMe = false } = body;

  const normalisedUsername = (username ?? '').trim().toLowerCase();

  let role: 'driver' | 'office' | null = null;

  if (normalisedUsername === 'driver' && password === process.env.DRIVER_PASSWORD) {
    role = 'driver';
  } else if (normalisedUsername === 'office' && password === process.env.OFFICE_PASSWORD) {
    role = 'office';
  }

  if (!role) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  // Session regeneration: destroy then create fresh
  const oldSession = await getSession();
  await oldSession.destroy();

  const session = await getSession(rememberMe);
  session.userId = `${role}-session`;
  session.role = role;
  await session.save();

  const ip = request.headers.get('x-forwarded-for') ?? '';
  db.insert(auditLogs)
    .values({
      id: crypto.randomUUID(),
      userId: session.userId,
      action: 'login',
      details: { role },
      ipAddress: ip,
    })
    .catch(() => {});

  return NextResponse.json({ ok: true, role });
}
