export function formatPostcode(postcode: string): string {
  const p = postcode.toUpperCase().replace(/\s+/g, '');
  // Insert space before last 3 chars: SW1A1AA → SW1A 1AA
  if (p.length > 3) return p.slice(0, p.length - 3) + ' ' + p.slice(p.length - 3);
  return p;
}
