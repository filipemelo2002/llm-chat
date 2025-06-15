import { StorageService } from "@services/storage.service";
import { UseCase } from "./uses-cases.types";

export const FOLDER_NAME = "llm-vectors";

export class UploadFileUseCase implements UseCase {
  constructor(private storageService: StorageService = new StorageService()) {}

  async execute(file: Express.Multer.File) {
    const folder = await this.storageService.findFolder(FOLDER_NAME);
    if (!folder) {
      await this.storageService.createFolder(FOLDER_NAME);
    }

    const fileName = `${Date.now()}-${file.originalname}`
    const response = await this.storageService.storeFile({
      fileContent: file.buffer,
      folder: FOLDER_NAME,
      fileName,
    });

    return {
      fileName,
      data: response
    };
  }
}
