import type { PhoneNumber } from './types';

export function normalisePhone(raw: string): PhoneNumber | null {
  const stripped = raw.replace(/\D/g, '');
  let canonical = stripped;

  if (canonical.startsWith('44') && canonical.length > 10) {
    canonical = '0' + canonical.slice(2);
  } else if (canonical.startsWith('0044')) {
    canonical = '0' + canonical.slice(4);
  }

  if (canonical.length < 10) return null;

  return { canonical, display: raw };
}

export function canonicalPhone(raw: string): string {
  const result = normalisePhone(raw);
  return result?.canonical ?? raw.replace(/\D/g, '');
}
