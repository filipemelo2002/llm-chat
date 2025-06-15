import { StorageService } from "@services/storage.service";
import { FOLDER_NAME } from "./uploadFile.usecase";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { VectorStore } from "@services/vectorstore.service";
import { logger } from "@utils/logger.utils";
import { UseCase } from "./uses-cases.types";

export class ProcessAndEmbedFileUseCase implements UseCase {
  constructor(
    private storageService = new StorageService(),
    private vectorStore = new VectorStore()
  ) {}

  async execute({ id, fileName }: { id?: string; fileName: string }) {
    logger.info(`[${id}] Starting file embedding: ${fileName}`);
    const file = await this.storageService.getFile({
      folder: FOLDER_NAME,
      fileName: fileName,
    });

    if (!file) {
      logger.error(`[${id}] Error fetching file`);
      throw new Error("Error fetching file: " + fileName);
    }

    const fileStr = await file.transformToString();
    const textSplitter = new RecursiveCharacterTextSplitter();
    logger.info(`[${id}] Splitting file into chunks...`);
    const chunks = await textSplitter.createDocuments([fileStr]);
    logger.info(`[${id}] Saving document chunks as vector arrays...`);
    const vectors = await this.vectorStore.saveDocumentsAsVectors(chunks);
    logger.info(`[${id}] Vectors processed: ${vectors.length}`);
  }
}
