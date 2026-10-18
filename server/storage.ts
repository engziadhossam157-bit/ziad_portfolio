// File storage: Vercel Blob when BLOB_READ_WRITE_TOKEN is set, otherwise AWS S3.
// Blob files are stored under an unguessable random suffix and returned as their own URL.
// S3 uploads happen server-side; downloads are served through a short-lived presigned GET
// URL via the /storage/* proxy route so the bucket itself never needs to be public.

import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { put } from "@vercel/blob";
import { ENV } from "./_core/env";

export const blobConfigured = () => !!ENV.blobReadWriteToken;

let _client: S3Client | null = null;

function getClient(): S3Client {
  if (!ENV.awsRegion || !ENV.awsS3Bucket || !ENV.awsAccessKeyId || !ENV.awsSecretAccessKey) {
    throw new Error(
      "Storage config missing: set AWS_REGION, AWS_S3_BUCKET, AWS_ACCESS_KEY_ID, and AWS_SECRET_ACCESS_KEY"
    );
  }
  if (!_client) {
    _client = new S3Client({
      region: ENV.awsRegion,
      credentials: {
        accessKeyId: ENV.awsAccessKeyId,
        secretAccessKey: ENV.awsSecretAccessKey,
      },
    });
  }
  return _client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const body = typeof data === "string" ? Buffer.from(data) : data;

  if (blobConfigured()) {
    const blob = await put(normalizeKey(relKey), Buffer.from(body), {
      access: "public",
      addRandomSuffix: true,
      contentType,
      token: ENV.blobReadWriteToken,
    });
    return { key: blob.pathname, url: blob.url };
  }

  const client = getClient();
  const key = appendHashSuffix(normalizeKey(relKey));

  await client.send(
    new PutObjectCommand({
      Bucket: ENV.awsS3Bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    })
  );

  return { key, url: `/storage/${key}` };
}

export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/storage/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const client = getClient();
  const key = normalizeKey(relKey);

  return getSignedUrl(
    client,
    new GetObjectCommand({ Bucket: ENV.awsS3Bucket, Key: key }),
    { expiresIn: 300 }
  );
}
