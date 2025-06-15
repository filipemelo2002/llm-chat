import { VectorStore } from "@services/vectorstore.service";

export class ProcessChatMessageUseCase {
  constructor(private vectorStore = new VectorStore()) {}
  async execute(message: string) {
    const stream = await this.vectorStore.retrieveRelevantDocuments(message);
    return {
      stream,
    };
  }
}
