import { Request, Response } from "express";
import { UploadFileUseCase } from "@application/use-cases/uploadFile.usecase";
import { QueueEmbedingProcessUseCase } from "@application/use-cases/queueEmbedingProcess.usecase";

export class FilesProcessingController {
  constructor(
    private uploadFileUseCase: UploadFileUseCase = new UploadFileUseCase(),
    private  queueEmbedingProcessUseCase = new QueueEmbedingProcessUseCase()
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
      const {fileName} = await this.uploadFileUseCase.execute(file);
      const id = await this.queueEmbedingProcessUseCase.execute({filename: fileName});
      response.status(200).json({
        message: "File uploaded successfully",
        processId: id
      });
    return;
    } catch (exception) {
      response.status(500).json({
        message: "Error when processing file. Try again later.",
      });
      process.exit(-1);
    }
  }
}
