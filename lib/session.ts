import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  role?: 'driver' | 'office';
}

const sevenDays = 60 * 60 * 24 * 7;
const thirtyDays = 60 * 60 * 24 * 30;

export function sessionOptions(rememberMe: boolean) {
  return {
    password: process.env.SESSION_SECRET!,
    cookieName: 'projuice_session',
    cookieOptions: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      maxAge: rememberMe ? thirtyDays : sevenDays,
    },
  };
}

export async function getSession(rememberMe = false) {
  return getIronSession<SessionData>(await cookies(), sessionOptions(rememberMe));
}
