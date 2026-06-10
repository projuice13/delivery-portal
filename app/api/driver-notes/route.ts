export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { driverNotes, auditLogs } from '@/lib/schema';
import { isImageFile, optimiseImage } from '@/lib/imageOptimizer';
import { sendNoteEmail } from '@/lib/email';

const NoteSchema = z.object({
  driverName: z.string().min(1),
  postcode: z.string().min(1),
  what3words: z.string().default(''),
  notes: z.string().min(1),
  fileName: z.string().default(''),
  fileContent: z.string().default(''),
});

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const timeoutPromise = new Promise<NextResponse>((_, reject) =>
    setTimeout(() => reject(new Error('timeout')), 30000)
  );

  try {
    const result = await Promise.race([
      handleRequest(request, session.userId),
      timeoutPromise,
    ]);
    return result;
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'timeout') {
      return NextResponse.json({ error: 'Request timed out' }, { status: 504 });
    }
    console.error('driver-notes error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleRequest(request: NextRequest, userId: string): Promise<NextResponse> {
  const body = await request.json();
  const parsed = NoteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  let rawFileContent = data.fileContent;

  // Optimise image if applicable
  if (data.fileName && data.fileContent && isImageFile(data.fileName)) {
    rawFileContent = await optimiseImage(data.fileContent, data.fileName);
  } else if (data.fileContent) {
    // Strip data-url prefix if present
    const prefix = data.fileContent.match(/^data:[^;]+;base64,/)?.[0] ?? '';
    rawFileContent = data.fileContent.slice(prefix.length);
  }

  // Insert to DB — never store file content
  const noteId = crypto.randomUUID();
  await db.insert(driverNotes).values({
    id: noteId,
    driverId: userId,
    driverName: data.driverName,
    postcode: data.postcode,
    what3words: data.what3words,
    notes: data.notes,
    fileName: data.fileName,
    fileContent: '', // never stored
  });

  const ip = request.headers.get('x-forwarded-for') ?? '';

  // Fire-and-forget: audit + email
  db.insert(auditLogs)
    .values({
      id: crypto.randomUUID(),
      userId,
      action: 'submit_notes',
      details: { postcode: data.postcode, driverName: data.driverName },
      ipAddress: ip,
    })
    .catch(() => {});

  sendNoteEmail({
    driverName: data.driverName,
    postcode: data.postcode,
    what3words: data.what3words,
    notes: data.notes,
    fileName: data.fileName,
    fileContent: rawFileContent,
  }).catch((err) => {
    console.error('sendNoteEmail error:', err);
  });

  return NextResponse.json({ id: noteId, ok: true });
}
