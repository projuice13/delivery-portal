const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'tiff'];

export function isImageFile(fileName: string): boolean {
  const ext = fileName.split('.').pop()?.toLowerCase() ?? '';
  return IMAGE_EXTS.includes(ext);
}

export async function optimiseImage(base64: string, fileName: string): Promise<string> {
  try {
    const sharp = (await import('sharp')).default;
    const prefix = base64.match(/^data:[^;]+;base64,/)?.[0] ?? '';
    const rawBase64 = base64.slice(prefix.length);
    const buffer = Buffer.from(rawBase64, 'base64');

    const optimised = await sharp(buffer)
      .rotate()
      .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 60, progressive: true })
      .toBuffer();

    return optimised.toString('base64');
  } catch {
    // fallback: return original
    const prefix = base64.match(/^data:[^;]+;base64,/)?.[0] ?? '';
    return base64.slice(prefix.length);
  }
}
