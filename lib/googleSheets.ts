import { google } from 'googleapis';
import type { DeliveryData, DeliveryEntry, InstructionWithSource } from './types';
import { normalisePhone, canonicalPhone } from './phone';
import { convertDriveUrl } from './driveUrl';

export async function getUncachableGoogleSheetClient() {
  const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY!);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });
  return google.sheets({ version: 'v4', auth });
}

function normalisePostcode(p: string) {
  return p.toUpperCase().replace(/\s+/g, '');
}

export async function lookupPostcode(postcode: string): Promise<DeliveryData | null> {
  const normalised = normalisePostcode(postcode);
  const sheets = await getUncachableGoogleSheetClient();
  const sheetId = process.env.GOOGLE_SHEET_ID!;

  const [importRes, libraryRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Import!A:AR' }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Library!A:H' }),
  ]);

  const importRows = importRes.data.values ?? [];
  const libraryRows = libraryRes.data.values ?? [];

  const mergedMap = new Map<string, DeliveryEntry>();

  // Import tab — no header row, data from index 0
  for (const row of importRows) {
    const rowPostcode = normalisePostcode((row[18] as string) ?? '');
    if (rowPostcode !== normalised) continue;

    const companyName = (row[8] as string) ?? '';
    const phone = (row[19] as string) ?? '';
    const instructions = (row[43] as string) ?? '';
    const key = companyName.toLowerCase();

    const existing = mergedMap.get(key) ?? {
      companyName,
      what3words: [],
      phone: [],
      instructions: [],
    };

    if (phone) {
      const normalPhone = normalisePhone(phone);
      if (normalPhone) {
        const canon = canonicalPhone(phone);
        if (!existing.phone.some(p => p.canonical === canon)) {
          existing.phone.push(normalPhone);
        }
      }
    }

    if (instructions && instructions !== 'No instructions available') {
      const inst: InstructionWithSource = {
        text: instructions,
        source: 'import',
        label: 'Order instructions',
      };
      existing.instructions.push(inst);
    }

    mergedMap.set(key, existing);
  }

  // Library tab — header in row 1 (index 0), data from index 1
  for (let i = 1; i < libraryRows.length; i++) {
    const row = libraryRows[i];
    const rowPostcode = normalisePostcode((row[0] as string) ?? '');
    if (rowPostcode !== normalised) continue;

    const companyName = (row[2] as string) ?? '';
    const w3w = (row[4] as string) ?? '';
    const notes = (row[5] as string) ?? '';
    const image1 = (row[6] as string) ?? '';
    const image2 = (row[7] as string) ?? '';
    const key = companyName.toLowerCase();

    const existing = mergedMap.get(key) ?? {
      companyName,
      what3words: [],
      phone: [],
      instructions: [],
    };

    if (w3w && !existing.what3words.map(w => w.toLowerCase()).includes(w3w.toLowerCase())) {
      existing.what3words.push(w3w);
    }

    if (notes && notes !== 'No instructions available') {
      const inst: InstructionWithSource = {
        text: notes,
        source: 'library',
        label: 'Instructions Library',
      };
      existing.instructions.push(inst);
    }

    const img1 = image1 ? convertDriveUrl(image1) : undefined;
    const img2 = image2 ? convertDriveUrl(image2) : undefined;

    if (img1 && !existing.image1Url) existing.image1Url = img1;
    else if (img1 && !existing.image2Url && img1 !== existing.image1Url) existing.image2Url = img1;

    if (img2 && !existing.image1Url) existing.image1Url = img2;
    else if (img2 && !existing.image2Url && img2 !== existing.image1Url) existing.image2Url = img2;

    mergedMap.set(key, existing);
  }

  if (mergedMap.size === 0) return null;

  // Drop "No instructions available" placeholder when real instructions exist
  const entries: DeliveryEntry[] = Array.from(mergedMap.values()).map(entry => {
    const hasReal = entry.instructions.some(i => i.text !== 'No instructions available');
    if (hasReal) {
      entry.instructions = entry.instructions.filter(i => i.text !== 'No instructions available');
    }
    return entry;
  });

  return { postcode: normalised, entries };
}

export async function getAllPostcodes(): Promise<string[]> {
  const sheets = await getUncachableGoogleSheetClient();
  const sheetId = process.env.GOOGLE_SHEET_ID!;

  const [importRes, libraryRes] = await Promise.all([
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Import!S:S' }),
    sheets.spreadsheets.values.get({ spreadsheetId: sheetId, range: 'Library!A:A' }),
  ]);

  const set = new Set<string>();

  for (const row of importRes.data.values ?? []) {
    const pc = ((row[0] as string) ?? '').toUpperCase().replace(/\s+/g, '');
    if (pc) set.add(pc);
  }

  // Library: skip header (row 0)
  const libRows = libraryRes.data.values ?? [];
  for (let i = 1; i < libRows.length; i++) {
    const pc = ((libRows[i][0] as string) ?? '').toUpperCase().replace(/\s+/g, '');
    if (pc) set.add(pc);
  }

  return Array.from(set).sort();
}
