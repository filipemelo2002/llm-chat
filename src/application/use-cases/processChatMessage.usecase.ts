import { LLMService } from "@services/llm.service";
import { VectorStore } from "@services/vectorstore.service";

export class ProcessChatMessageUseCase {
  constructor(
    private vectorStore = new VectorStore(),
    private llmService = new LLMService()
  ) {}
  async execute(message: string) {
    const retriever = await this.vectorStore.getRetriever();
    const stream = await this.llmService.processPrompt({
      prompt: message,
      retriever,
    });
    return {
      stream,
    };
  }
}
