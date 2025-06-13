import { Request, Response } from "express";
import { UploadFileUseCase } from "../../application/use-cases/uploadFile.usecase";
import { storageProvider } from "../../services/storage-provider.service";

export class FilesProcessingController {
  constructor(
    private uploadFileUseCase: UploadFileUseCase = new UploadFileUseCase(
      storageProvider
    )
  ) {}
  async processFile(request: Request, response: Response) {
    const file = request.file;
    if (!file) {
      response.status(400).json({
        message: "Missing file, could not process request.",
      });
      return;
    }

    await this.uploadFileUseCase.execute(file);

    response.status(200).json({
      message: "File uploaded successfully",
    });
    return;
  }
}
