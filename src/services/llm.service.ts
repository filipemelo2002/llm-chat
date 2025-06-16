import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { VectorStoreRetrieverInterface } from "@langchain/core/vectorstores";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { logger } from "@utils/logger.utils";

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

  async processPrompt({
    prompt,
    retriever,
  }: {
    prompt: string;
    retriever: VectorStoreRetrieverInterface;
  }) {
    const promptTemplate = ChatPromptTemplate.fromTemplate(`
You are an AI assistant that provides accurate and helpful answers based strictly on the given context.
Follow these rules:
1. If the answer is found in the context, respond concisely and cite relevant parts.
2. If the answer isn't in the context, say "I couldn't find this in the provided documents," and avoid guessing.
3. If the question is ambiguous or unclear, ask for clarification.

Context: {context}

Question: {input}

Answer:
`);
    const combineDocsChain = await createStuffDocumentsChain({
      llm: this.llm,
      prompt: promptTemplate,
    });
    const retrievalChain = await createRetrievalChain({
      combineDocsChain,
      retriever,
    });

    const transformStream = new TransformStream<{
      context: Document[];
      answer: string;
    }>({
      transform(chunk, controller) {
        try {
          if (chunk.answer) {
            controller.enqueue(chunk.answer);
          }
        } catch (err) {
          logger.error("Tansform error: ", err);
        }
      },
    });
    const stream = await retrievalChain.stream({ input: prompt });
    return stream.pipeThrough(transformStream);
  }
}
