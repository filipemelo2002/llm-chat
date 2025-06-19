import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { VectorStoreRetrieverInterface } from "@langchain/core/vectorstores";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createHistoryAwareRetriever } from "langchain/chains/history_aware_retriever";
import {
  BaseMessage,
  SystemMessage,
} from "@langchain/core/messages";

export class LLMService {
  constructor(
    private embedder = new OllamaEmbeddings({
      model: "deepseek-r1:8b",
      baseUrl: "http://localhost:11434",
      maxRetries: 2,
    }),
    private llm = new ChatOllama({
      model: "deepseek-r1:8b",
      baseUrl: "http://localhost:11434",
      temperature: 0.2,
    })
  ) {}

  embedDocument(document: Document<Record<string, any>>) {
    return this.embedder.embedQuery(document.pageContent);
  }

  private async createRagChain(retriever: VectorStoreRetrieverInterface) {
    const contextualizedPrompt = ChatPromptTemplate.fromMessages([
      ["system",
        "Given a chat history and the latest user question " +
          "which might reference context in the chat history, " +
          "formulate a standalone question which can be understood " +
          "without the chat history. Do NOT answer the question, " +
          "just reformulate it if needed and otherwise return it as is."
      ],
      new MessagesPlaceholder("chat_history"),
      ["human", "{input}"],
    ]);

    const historyRetriever = await createHistoryAwareRetriever({
      llm: this.llm,
      retriever,
      rephrasePrompt: contextualizedPrompt,
    });

    const promptTemplate = ChatPromptTemplate.fromMessages([
      new SystemMessage(`
        You are an AI assistant that provides accurate and helpful answers based strictly on the given context.
Follow these rules:
1. If the answer is found in the context, respond concisely and cite relevant parts.
2. If the answer isn't in the context, say "I couldn't find this in the provided documents," and avoid guessing.
3. If the question is ambiguous or unclear, ask for clarification.
`),
      new MessagesPlaceholder("chat_history"),
      ["human", "context: {context} input: {input}"],
    ]);

    const qaAnswerChain = await createStuffDocumentsChain({
      llm: this.llm,
      prompt: promptTemplate,
    });
    const retrievalChain = await createRetrievalChain({
      combineDocsChain: qaAnswerChain,
      retriever: historyRetriever,
    });
    return retrievalChain;
  }

  async processPrompt({
    prompt,
    retriever,
    messages,
  }: {
    prompt: string;
    retriever: VectorStoreRetrieverInterface;
    messages: BaseMessage[];
  }) {
    const ragChain = await this.createRagChain(retriever);
    const response = await ragChain.invoke({
      input: prompt,
      chat_history: messages,
    });
    return response;
  }
}
