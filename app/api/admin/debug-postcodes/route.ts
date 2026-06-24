export const runtime = 'nodejs';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';
export async function GET() {
  const session = await getSession();
  if (!session.userId || session.role !== 'office') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rows = await db.execute(sql`SELECT postcode, COUNT(*) cnt FROM library_entries GROUP BY postcode HAVING COUNT(*) > 1 ORDER BY cnt DESC LIMIT 10`);
  return NextResponse.json({ rows: rows.rows });
}
