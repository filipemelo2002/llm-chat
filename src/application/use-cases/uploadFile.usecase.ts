import { PutObjectCommand, HeadBucketCommand, S3Client, CreateBucketCommand } from "@aws-sdk/client-s3";

export class UploadFileUseCase {
  private storageProvider: S3Client;
  constructor (
    storageProvider: S3Client
  ) {
    this.storageProvider = storageProvider
  }

  async execute(file: Express.Multer.File) {
    try {
      await this.storageProvider.send(new HeadBucketCommand({
        Bucket: 'llm-vectors'
      }))
    } catch (exception: any) {
      if (exception.name === "NotFound") {
        await this.storageProvider.send(new CreateBucketCommand({
          Bucket: 'llm-vectors'
        }))
      }
    }

    const command = new PutObjectCommand({
      Bucket: 'llm-vectors',
      Body: file.buffer,
      Key: `${Date.now()}-${file.originalname}`
    })
    await this.storageProvider.send(command)
  }
}
