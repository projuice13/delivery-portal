export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getAllPostcodes } from '@/lib/googleSheets';

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const postcodes = await getAllPostcodes();
  return NextResponse.json({ postcodes });
}
