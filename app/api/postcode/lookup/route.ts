export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { lookupPostcode } from '@/lib/googleSheets';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/schema';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postcode } = await request.json();
  const result = await lookupPostcode(postcode);

  const ip = request.headers.get('x-forwarded-for') ?? '';
  db.insert(auditLogs)
    .values({
      id: crypto.randomUUID(),
      userId: session.userId,
      action: 'postcode_lookup',
      details: { postcode },
      ipAddress: ip,
    })
    .catch(() => {});

  if (!result) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(result);
}
