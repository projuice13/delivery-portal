export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

const BUILD_VERSION =
  process.env.VERSION ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  Date.now().toString();

export function GET() {
  return NextResponse.json({ version: BUILD_VERSION });
}
