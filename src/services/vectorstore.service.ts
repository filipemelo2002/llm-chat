import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { ChatOllama, OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { Pool } from "pg";
import { logger } from "@utils/logger.utils";
import { ChatPromptTemplate } from "@langchain/core/prompts";

export class VectorStore {
  private store?: PGVectorStore;
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

  private async getStore() {
    if (!this.store) {
      const pool = new Pool({
        user: "llm_user",
        password: "11m_s3cr3t",
        database: "llm_vectors",
        host: "localhost",
        port: 5432,
      })
      this.store = await PGVectorStore.initialize(this.embedder, {
        tableName: "llm_chat_vectors",
        pool,
        columns: {
          idColumnName: "id",
          vectorColumnName: "vector",
          contentColumnName: "content",
          metadataColumnName: "metadata",
        },
      });
    }
    return this.store;
  }

  async parseDocumentToVector(document: Document<Record<string, any>>) {
    return this.embedder.embedQuery(document.pageContent);
  }
  async saveDocumentsAsVectors(chunks: Document<Record<string, any>>[]) {

    const store = await this.getStore();
    const vectors = []
    for (const chunk of chunks) {
      const parsedVector = await this.parseDocumentToVector(chunk)
      vectors.push(parsedVector)
      logger.info(`processed ${vectors.length} out of ${chunks.length}`)
      await store.addVectors([parsedVector], [chunk])
    }

    return vectors;
  }

  async retrieveRelevantDocuments(value: string) {
    const store = await this.getStore();
    const retriever = store.asRetriever();
    const prompt = ChatPromptTemplate.fromTemplate(
      `Answer the user's question: {input} based on the following context {context}`
    );
    const combineDocsChain = await createStuffDocumentsChain({
      llm: this.llm,
      prompt,
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
    const stream = await retrievalChain.stream({ input: value });
    return stream.pipeThrough(transformStream);
  }
}
