export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { eq, asc } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { driverNotes } from '@/lib/schema';

export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== 'office') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const notes = await db
    .select()
    .from(driverNotes)
    .where(eq(driverNotes.status, 'pending'))
    .orderBy(asc(driverNotes.createdAt));

  return NextResponse.json({ notes });
}
