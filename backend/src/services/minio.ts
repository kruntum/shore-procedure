import { Client, CopyConditions } from 'minio';
import { config } from '../config';

export const minioClient = new Client({
  endPoint: config.minio.endPoint,
  port: config.minio.port,
  useSSL: config.minio.useSSL,
  accessKey: config.minio.accessKey,
  secretKey: config.minio.secretKey,
});

export const BUCKET_NAME = config.minio.bucket;

export async function ensureBucket() {
  try {
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      await minioClient.makeBucket(BUCKET_NAME);
      console.log(`Bucket ${BUCKET_NAME} created successfully.`);
    }
  } catch (err) {
    console.error('Failed to verify/create MinIO bucket:', err);
  }
}

export async function uploadFile(
  objectKey: string,
  buffer: Buffer,
  metaData: Record<string, string> = {}
) {
  return await minioClient.putObject(BUCKET_NAME, objectKey, buffer, buffer.length, metaData);
}

export async function copyFile(sourceKey: string, destKey: string) {
  const conds = new CopyConditions();
  return await minioClient.copyObject(BUCKET_NAME, destKey, `/${BUCKET_NAME}/${sourceKey}`, conds);
}

export async function getFileStream(objectKey: string) {
  return await minioClient.getObject(BUCKET_NAME, objectKey);
}

export async function deleteFile(objectKey: string) {
  return await minioClient.removeObject(BUCKET_NAME, objectKey);
}

