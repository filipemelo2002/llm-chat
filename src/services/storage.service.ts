import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
const {
  STORAGE_ENDPOINT,
  STORAGE_REGION,
  STORAGE_ACCESS_KEY_ID,
  STORAGE_ACCESS_SECRET_KEY,
} = process.env;

export class StorageService {
  constructor(
    private storageProvider: S3Client = new S3Client({
      endpoint: STORAGE_ENDPOINT,
      region: STORAGE_REGION,
      credentials: {
        accessKeyId: STORAGE_ACCESS_KEY_ID || "minioadmin",
        secretAccessKey: STORAGE_ACCESS_SECRET_KEY || "minioadmin",
      },
      forcePathStyle: true,
    })
  ) {}

  async findFolder(name: string) {
    try {
      const response = await this.storageProvider.send(
        new HeadBucketCommand({
          Bucket: name,
        })
      );
      return response;
    } catch (exception: any) {
      if (exception.name === "NotFound") {
        return null;
      }
      throw new Error("Error fetching folder: " + name);
    }
  }

  async createFolder(name: string) {
    const response = await this.storageProvider.send(
      new CreateBucketCommand({
        Bucket: name,
      })
    );
    return response;
  }

  async storeFile({
    fileContent,
    fileName,
    folder,
  }: {
    folder: string;
    fileName: string;
    fileContent: Buffer<ArrayBufferLike>;
  }) {
    const command = new PutObjectCommand({
      Bucket: folder,
      Body: fileContent,
      Key: fileName,
    });
    const response = await this.storageProvider.send(command);
    return response;
  }

  async getFile({ fileName, folder }: { folder: string; fileName: string }) {
    const command = new GetObjectCommand({
      Bucket: folder,
      Key: fileName,
    });
    const response = await this.storageProvider.send(command);
    const body = response.Body;
    return body;
  }
}
