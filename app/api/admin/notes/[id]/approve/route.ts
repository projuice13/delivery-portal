export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { driverNotes, libraryEntries } from '@/lib/schema';

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

  // Allow the office team to optionally edit the text/company before approving
  const body = await request.json().catch(() => ({}));
  const companyName: string = body.companyName ?? '';
  const notesText: string = body.notes ?? note.notes;
  const what3words: string = body.what3words ?? note.what3words;

  if (note.targetLibraryEntryId) {
    // Edit request — update the existing library entry
    await db
      .update(libraryEntries)
      .set({
        what3words,
        notes: notesText,
        ...(note.fileUrl ? { image1Url: note.fileUrl } : {}),
        updatedAt: new Date(),
      })
      .where(eq(libraryEntries.id, note.targetLibraryEntryId));
  } else {
    // New entry — insert a fresh library row
    await db.insert(libraryEntries).values({
      id: crypto.randomUUID(),
      postcode: note.postcode,
      companyName,
      what3words,
      notes: notesText,
      image1Url: note.fileUrl ?? '',
      image2Url: '',
      source: 'driver-submission',
      sourceNoteId: note.id,
    });
  }

  await db
    .update(driverNotes)
    .set({ status: 'approved', reviewedBy: session.userId, reviewedAt: new Date() })
    .where(eq(driverNotes.id, id));

  return NextResponse.json({ ok: true });
}
