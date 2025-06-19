import { ChatHistoryServiceFactory } from "@services/chat-history.service";
import { LLMService } from "@services/llm.service";
import { VectorStore } from "@services/vectorstore.service";
export class ProcessChatMessageUseCase {
  constructor(
    private vectorStore = new VectorStore(),
    private llmService = new LLMService(),
    private chatHistoryServiceFactory = new ChatHistoryServiceFactory()
  ) {}
  async execute({
    message,
    sessionId,
  }: {
    message: string;
    sessionId: string;
  }) {
    const chatHistoryService = this.chatHistoryServiceFactory.createChatHistoryService(sessionId)
    const messages = await chatHistoryService.getMessages()
    const retriever = await this.vectorStore.getRetriever();
    const response = await this.llmService.processPrompt({
      prompt: message,
      retriever,
      messages: messages
    });
    await chatHistoryService.addUserMessage(message)
    await chatHistoryService.addAIMessage(response.answer)
    return {
      response: response.answer
    };
  }
}
