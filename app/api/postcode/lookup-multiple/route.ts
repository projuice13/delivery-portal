export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { lookupPostcode } from '@/lib/googleSheets';
import { db } from '@/lib/db';
import { auditLogs } from '@/lib/schema';
import type { DeliveryResult } from '@/lib/types';

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postcodes } = await request.json();

  const results: DeliveryResult[] = await Promise.all(
    postcodes.map(async (postcode: string) => {
      const data = await lookupPostcode(postcode).catch(() => null);
      return { postcode, data };
    })
  );

  const ip = request.headers.get('x-forwarded-for') ?? '';
  db.insert(auditLogs)
    .values({
      id: crypto.randomUUID(),
      userId: session.userId,
      action: 'postcode_lookup_multiple',
      details: { postcodes },
      ipAddress: ip,
    })
    .catch(() => {});

  return NextResponse.json({ results });
}
