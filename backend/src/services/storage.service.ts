import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env.js';

const isMock = !env.STORAGE_ENDPOINT;

let s3: S3Client | null = null;
if (!isMock) {
  s3 = new S3Client({
    endpoint: env.STORAGE_ENDPOINT,
    region: env.STORAGE_REGION || 'auto',
    credentials: {
      accessKeyId: env.STORAGE_ACCESS_KEY!,
      secretAccessKey: env.STORAGE_SECRET_KEY!,
    },
  });
}

type UploadResult = { url: string; key: string };

/**
 * Upload un fichier vers S3/R2 ou retourne une data-URL en dev.
 */
export async function uploadToStorage(
  file: { buffer: Buffer; mimetype: string; originalname: string; size: number },
  folder: string
): Promise<UploadResult> {
  const key = `${folder}/${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  
  if (isMock) {
    // Mode dev : retourne une data URL
    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return { url: dataUrl, key };
  }
  
  await s3!.send(new PutObjectCommand({
    Bucket: env.STORAGE_BUCKET!,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  }));
  
  const url = `${env.STORAGE_PUBLIC_URL}/${key}`;
  return { url, key };
}
