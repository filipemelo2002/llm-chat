import {PostgresChatMessageHistory} from "@langchain/community/stores/message/postgres"
import { logger } from "@utils/logger.utils";
import { Pool } from "pg";

const connection = {
  host: process.env.REDIS_HOST ?? "127.0.0.1",
  port: Number(process.env.REDIS_PORT) ?? 6379,
};
class ChatHistoryService {
  private chatHistory: PostgresChatMessageHistory
  constructor(
    private sessionId: string,
  ) {
    this.chatHistory = new PostgresChatMessageHistory({
      sessionId: this.sessionId,
      tableName: "llm_chat_history",
      pool: new Pool({
              user: "llm_user",
              password: "11m_s3cr3t",
              database: "llm_vectors",
              host: "localhost",
              port: 5432,
            })
    })
  }
  getChatHistory() {
    return this.chatHistory;
  }

  getSessionId() {
    return this.sessionId;
  }

  getMessages() {
    return this.chatHistory.getMessages()
  }

  async addUserMessage(message: string) {
    await this.chatHistory.addUserMessage(message);
  }

  async addAIMessage(message: string) {
    await this.chatHistory.addAIMessage(message);
  }
}

export class ChatHistoryServiceFactory {
  createChatHistoryService(sessionId: string) {
    return new ChatHistoryService(sessionId);
  }
}
