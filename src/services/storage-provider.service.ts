import { S3Client } from "@aws-sdk/client-s3";
const {
  STORAGE_ENDPOINT,
  STORAGE_REGION,
  STORAGE_ACCESS_KEY_ID,
  STORAGE_ACCESS_SECRET_KEY,
} = process.env;

export const storageProvider = new S3Client({
  endpoint: STORAGE_ENDPOINT,
  region: STORAGE_REGION,
  credentials: {
    accessKeyId: STORAGE_ACCESS_KEY_ID || "minioadmin",
    secretAccessKey: STORAGE_ACCESS_SECRET_KEY || "minioadmin",
  },
  forcePathStyle: true,
});
