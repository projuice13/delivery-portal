export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { driverNotes } from '@/lib/schema';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session.userId || session.role !== 'office') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const [note] = await db.select().from(driverNotes).where(eq(driverNotes.id, id));
  if (!note) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (note.status !== 'pending') {
    return NextResponse.json({ error: 'Note already reviewed' }, { status: 409 });
  }

  await db
    .update(driverNotes)
    .set({ status: 'rejected', reviewedBy: session.userId, reviewedAt: new Date() })
    .where(eq(driverNotes.id, id));

  return NextResponse.json({ ok: true });
}
