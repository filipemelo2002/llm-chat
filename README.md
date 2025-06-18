# 🧠 AI Chatbot with Document Retrieval using LangChain, pgvector, and Ollama

This project is a full-stack AI chatbot system that allows users to upload files (PDF, DOCX, TXT, etc.), processes them into vector embeddings, stores them in a PostgreSQL database with `pgvector`, and uses a local LLM (like `deepseek-r1:8b` via Ollama) to answer natural language questions based on the document content.

---

## 🚀 Features

- 🗂️ Upload support for PDF, DOCX, TXT, HTML, Markdown, and EML
- 📤 File storage with self-hosted [MinIO](https://min.io/) (S3-compatible)
- 📄 Automatic text extraction and chunking
- 🔎 Semantic search using [LangChain](https://js.langchain.com/) + `RecursiveCharacterTextSplitter`
- 🧠 Embedding via [Ollama Embeddings](https://github.com/langchain-ai/langchainjs)
- 🛢️ Vector storage in PostgreSQL using the [`pgvector`](https://github.com/pgvector/pgvector) extension
- 💬 Retrieval-Augmented Generation (RAG) chatbot using Ollama + LangChain
- ✅ Async file processing via BullMQ with Redis

---

## 📦 Tech Stack

| Layer         | Tech                                   |
|---------------|----------------------------------------|
| Frontend      | (You plug in your chat UI here)        |
| Backend       | Node.js + TypeScript + Express         |
| LLM           | [`Ollama`](https://ollama.com) (e.g. DeepSeek, Mistral) |
| Embeddings    | `nomic-embed-text` via Ollama          |
| Vector DB     | PostgreSQL + `pgvector`                |
| Document Split| `RecursiveCharacterTextSplitter`       |
| Storage       | MinIO (S3-compatible)                  |
| Queue         | BullMQ + Redis                         |

---

## 🧪 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-org/your-repo.git
cd your-repo
npm install
```
Also, you **must** have Ollama running locally. In this case, I recommend to run it using [docker compose](https://hub.docker.com/r/ollama/ollama).

### 2. Start Dev Services

```bash
docker-compose up -d  # Starts MinIO, Redis & PgVector
```
### 3. Run the App

```bash
npm run dev
```

### 📤 Upload Files
Send files using curl or a frontend form:
```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@./example.pdf"
```
The file will be:
- Stored in MinIO
- Parsed and chunked
- Embedded and stored in pgvector via BullMQ

### 💬 Ask Questions
Call your chat endpoint:
```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What tasks are carried out in post-processing?"}'

```
