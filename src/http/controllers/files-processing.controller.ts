import { Request, Response } from "express";
import { UploadFileUseCase } from "@application/use-cases/uploadFile.usecase";

export class FilesProcessingController {
  constructor(
    private uploadFileUseCase: UploadFileUseCase = new UploadFileUseCase()
  ) {}
  async processFile(request: Request, response: Response) {
    const file = request.file;
    if (!file) {
      response.status(400).json({
        message: "Missing file, could not process request.",
      });
      return;
    }

    try {
      await this.uploadFileUseCase.execute(file);
    } catch (exception) {
      response.status(500).json({
        message: "Error when processing file. Try again later.",
      });
      process.exit(-1);
    }

    response.status(200).json({
      message: "File uploaded successfully",
    });
    return;
  }
}
