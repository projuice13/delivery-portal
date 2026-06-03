export function convertDriveUrl(url: string): string {
  if (!url) return url;

  let fileId: string | null = null;

  const fileMatch = url.match(/\/file\/d\/([^/]+)/);
  if (fileMatch) fileId = fileMatch[1];

  if (!fileId) {
    const openMatch = url.match(/[?&]id=([^&]+)/);
    if (openMatch) fileId = openMatch[1];
  }

  if (!fileId && url.includes('drive.usercontent.google.com')) {
    const ucMatch = url.match(/[?&]id=([^&]+)/);
    if (ucMatch) fileId = ucMatch[1];
  }

  if (!fileId) return url;

  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`;
}
