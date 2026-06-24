export const runtime = 'nodejs';

/**
 * TEMPORARY endpoint — delete after use.
 * Re-syncs library_entries from the Google Sheet "Library" tab.
 * Deletes all rows with source='library' first, then re-inserts fresh.
 * Office-role auth required.
 */

import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { google } from 'googleapis';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { libraryEntries } from '@/lib/schema';

function normalisePostcode(p: string) {
  return p.toUpperCase().replace(/\s+/g, '');
}

export async function POST() {
  const session = await getSession();
  if (!session.userId || session.role !== 'office') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  const sheets = google.sheets({ version: 'v4', auth });
  const sheetId = process.env.GOOGLE_SHEET_ID!;

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: 'Library!A:H',
  });

  const rows = res.data.values ?? [];
  const entries: (typeof libraryEntries.$inferInsert)[] = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const postcode = normalisePostcode((row[0] as string) ?? '');
    if (!postcode) continue;

    entries.push({
      id: crypto.randomUUID(),
      postcode,
      companyName: (row[2] as string) ?? '',
      what3words: (row[4] as string) ?? '',
      notes: (row[5] as string) ?? '',
      image1Url: (row[6] as string) ?? '',
      image2Url: (row[7] as string) ?? '',
      source: 'library',
    });
  }

  // Delete all existing library-sourced entries (preserves driver-submission rows)
  await db.delete(libraryEntries).where(eq(libraryEntries.source, 'library'));

  // Re-insert in batches
  const BATCH_SIZE = 100;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    await db.insert(libraryEntries).values(entries.slice(i, i + BATCH_SIZE));
  }

  return NextResponse.json({ ok: true, rowsRead: rows.length - 1, inserted: entries.length });
}
