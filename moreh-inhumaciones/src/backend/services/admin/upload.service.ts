import path from 'path';
import { bucket } from '../../config/firebase';

export async function uploadToFirebase(
  buffer: Buffer,
  originalname: string,
  mimetype: string,
  folder = 'productos'
): Promise<string> {
  const ext = path.extname(originalname).toLowerCase();
  const filename = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const file = bucket.file(filename);

  await file.save(buffer, { metadata: { contentType: mimetype } });
  await file.makePublic();

  return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}

export async function deleteFromFirebase(url: string): Promise<void> {
  try {
    const match = url.match(/storage\.googleapis\.com\/[^/]+\/(.+)/);
    if (!match) return;
    await bucket.file(decodeURIComponent(match[1])).delete();
  } catch {
    // Si el archivo ya no existe en Storage, no interrumpir el flujo
  }
}
