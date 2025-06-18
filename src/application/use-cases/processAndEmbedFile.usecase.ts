import { StorageService } from "@services/storage.service";
import { FOLDER_NAME } from "./uploadFile.usecase";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { VectorStore } from "@services/vectorstore.service";
import { logger } from "@utils/logger.utils";
import { UseCase } from "./uses-cases.types";
import { LLMService } from "@services/llm.service";
import { FilesService } from "@services/files.service";

export class ProcessAndEmbedFileUseCase implements UseCase {
  constructor(
    private storageService = new StorageService(),
    private vectorStore = new VectorStore(),
    private llmService = new LLMService(),
    private fileService = new FilesService()
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

    const fileText = await this.fileService.getFileContentStream({
      file: file,
      filename: fileName
    })

    if (!fileText) {
      logger.error("Could export file as text")
      process.exit(-1)
    }

    const textSplitter = new RecursiveCharacterTextSplitter();
    logger.info(`[${id}] Splitting file into chunks...`);
    const chunks = await textSplitter.createDocuments([fileText]);
    logger.info(`[${id}] Saving document chunks as vector arrays...`);
    const vectors = [];
    for (const chunk of chunks) {
      const vector = await this.llmService.embedDocument(chunk);
      await this.vectorStore.saveVectorizedDocument({
        vector,
        document: chunk,
      });
      vectors.push(vector);
      logger.info(
        `[${id}] Processed ${vectors.length} chunks out of ${chunks.length}...`
      );
    }
    logger.info(`[${id}] Vectors processed: ${vectors.length}`);
  }
}
