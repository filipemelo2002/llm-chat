import { PGVectorStore } from "@langchain/community/vectorstores/pgvector";
import { OllamaEmbeddings } from "@langchain/ollama";
import { Document } from "@langchain/core/documents";
import { Pool } from 'pg'
import { logger } from "@utils/logger.utils";

export class VectorStore {
  private store?: PGVectorStore;
  constructor(
    private embedder = new OllamaEmbeddings({
      model: "deepseek-r1:8b",
      baseUrl: "http://localhost:11434",
      maxRetries: 2,
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
}
