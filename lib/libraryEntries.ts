import { eq } from 'drizzle-orm';
import { db } from './db';
import { libraryEntries } from './schema';

function normalisePostcode(p: string) {
  return p.toUpperCase().replace(/\s+/g, '');
}

export interface LibraryEntryRow {
  id: string;
  postcode: string;
  companyName: string;
  what3words: string;
  notes: string;
  image1Url: string;
  image2Url: string;
  source: string;
  sourceNoteId: string | null;
}

export async function getLibraryEntriesForPostcode(postcode: string): Promise<LibraryEntryRow[]> {
  const normalised = normalisePostcode(postcode);
  const rows = await db
    .select()
    .from(libraryEntries)
    .where(eq(libraryEntries.postcode, normalised));

  return rows.map(r => ({
    id: r.id,
    postcode: r.postcode,
    companyName: r.companyName,
    what3words: r.what3words,
    notes: r.notes,
    image1Url: r.image1Url,
    image2Url: r.image2Url,
    source: r.source,
    sourceNoteId: r.sourceNoteId,
  }));
}

export async function getAllLibraryPostcodes(): Promise<string[]> {
  const rows = await db
    .select({ postcode: libraryEntries.postcode })
    .from(libraryEntries)
    .groupBy(libraryEntries.postcode);

  return rows.map(r => normalisePostcode(r.postcode));
}

export async function insertLibraryEntry(entry: {
  postcode: string;
  companyName: string;
  what3words?: string;
  notes?: string;
  image1Url?: string;
  image2Url?: string;
  source: string;
  sourceNoteId?: string | null;
}) {
  await db.insert(libraryEntries).values({
    id: crypto.randomUUID(),
    postcode: normalisePostcode(entry.postcode),
    companyName: entry.companyName ?? '',
    what3words: entry.what3words ?? '',
    notes: entry.notes ?? '',
    image1Url: entry.image1Url ?? '',
    image2Url: entry.image2Url ?? '',
    source: entry.source,
    sourceNoteId: entry.sourceNoteId ?? null,
  });
}

export async function bulkInsertLibraryEntries(
  entries: {
    postcode: string;
    companyName: string;
    what3words?: string;
    notes?: string;
    image1Url?: string;
    image2Url?: string;
    source: string;
  }[]
) {
  if (entries.length === 0) return;
  await db.insert(libraryEntries).values(
    entries.map(entry => ({
      id: crypto.randomUUID(),
      postcode: normalisePostcode(entry.postcode),
      companyName: entry.companyName ?? '',
      what3words: entry.what3words ?? '',
      notes: entry.notes ?? '',
      image1Url: entry.image1Url ?? '',
      image2Url: entry.image2Url ?? '',
      source: entry.source,
    }))
  );
}
