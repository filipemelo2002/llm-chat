import type { StreamingBlobPayloadOutputTypes } from "@smithy/types";
import { logger } from "@utils/logger.utils";
import { getTextFromPdf, getTextFromDocx } from "@utils/file-extensions.utils";

export const SUPPORTED_EXTENSIONS = {
  PFD: "pdf",
  TXT: "txt",
  DOCX: "docx",
  DOC: "doc"
};

export class FilesService {
  constructor() {}

  private getFileExtension(filename: string) {
    const parts = filename.split(".");
    const extension = parts[parts.length - 1].toLocaleLowerCase();
    return extension;
  }

  async getFileContentStream({
    file,
    filename,
  }: {
    file: StreamingBlobPayloadOutputTypes;
    filename: string;
  }) {
    const fileExtension = this.getFileExtension(filename).trim();
    if (fileExtension === SUPPORTED_EXTENSIONS.PFD) {
      logger.info('Handling PDF file')
      const bufferArray = await file.transformToByteArray()
      return getTextFromPdf(Buffer.from(bufferArray))
    }

    if (fileExtension === SUPPORTED_EXTENSIONS.TXT) {
      logger.info('Handling PDF file')
      return file.transformToString("utf-8")
    }

    if (fileExtension === SUPPORTED_EXTENSIONS.DOC || fileExtension === SUPPORTED_EXTENSIONS.DOCX) {
      logger.info('Handling DOC/DOCX file')
      const bufferArray = await file.transformToByteArray()
      return getTextFromDocx(Buffer.from(bufferArray))
    }
  }

}
