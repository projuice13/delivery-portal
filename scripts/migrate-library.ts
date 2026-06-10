/**
 * One-time migration: read the existing "Library" tab from the Google Sheet
 * and seed the `library_entries` table in Postgres.
 *
 * Usage:
 *   npx tsx scripts/migrate-library.ts
 *
 * Requires GOOGLE_SERVICE_ACCOUNT_KEY, GOOGLE_SHEET_ID and DATABASE_URL
 * to be set in the environment (e.g. via `vercel env pull .env.local`
 * then `npx dotenv -e .env.local -- npx tsx scripts/migrate-library.ts`).
 */

import { google } from 'googleapis';
import { db, pool } from '../lib/db';
import { libraryEntries } from '../lib/schema';

function normalisePostcode(p: string) {
  return p.toUpperCase().replace(/\s+/g, '');
}

async function main() {
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
  console.log(`Read ${rows.length} rows from Library tab (including header).`);

  const entries: (typeof libraryEntries.$inferInsert)[] = [];

  // Skip header row (index 0)
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const postcode = normalisePostcode((row[0] as string) ?? '');
    if (!postcode) continue;

    const companyName = (row[2] as string) ?? '';
    const what3words = (row[4] as string) ?? '';
    const notes = (row[5] as string) ?? '';
    const image1Url = (row[6] as string) ?? '';
    const image2Url = (row[7] as string) ?? '';

    entries.push({
      id: crypto.randomUUID(),
      postcode,
      companyName,
      what3words,
      notes,
      image1Url,
      image2Url,
      source: 'library',
    });
  }

  console.log(`Prepared ${entries.length} library entries to insert.`);

  if (entries.length === 0) {
    console.log('Nothing to insert.');
    return;
  }

  // Insert in batches to avoid overly large queries
  const BATCH_SIZE = 100;
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    await db.insert(libraryEntries).values(batch);
    console.log(`Inserted ${Math.min(i + BATCH_SIZE, entries.length)}/${entries.length}`);
  }

  console.log('Done.');
}

main()
  .catch(err => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
