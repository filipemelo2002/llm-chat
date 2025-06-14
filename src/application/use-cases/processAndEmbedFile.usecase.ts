import { StorageService } from "@services/storage.service";
import { FOLDER_NAME } from "./uploadFile.usecase";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { VectorStore } from "@services/vectorstore.service";

export class ProcessAndEmbedFileUseCase {
  constructor(
    private storageService = new StorageService(),
    private vectorStore = new VectorStore()
  ) {}

  async exectute(fileName: string) {
    console.log("started file embedding: "+fileName)
    const file = await this.storageService.getFile({
      folder: FOLDER_NAME,
      fileName: fileName,
    });

    if (!file) {
      throw new Error("Error fetching file: " + fileName);
    }
    const fileStr = await file.transformToString();
    const textSplitter = new RecursiveCharacterTextSplitter();
    const chunks = await textSplitter.createDocuments([fileStr]);
    const vectors = await this.vectorStore.saveDocumentsAsVectors(chunks);
    console.log("vectors processed = ", vectors);
  }
}
