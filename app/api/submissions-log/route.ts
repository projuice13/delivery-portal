export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { desc } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { driverNotes } from '@/lib/schema';

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notes = await db
    .select({
      id: driverNotes.id,
      driverName: driverNotes.driverName,
      businessName: driverNotes.businessName,
      postcode: driverNotes.postcode,
      status: driverNotes.status,
      createdAt: driverNotes.createdAt,
      targetLibraryEntryId: driverNotes.targetLibraryEntryId,
    })
    .from(driverNotes)
    .orderBy(desc(driverNotes.createdAt));

  return NextResponse.json({ notes });
}
