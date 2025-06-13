import { Ollama } from "@langchain/ollama"
import { PromptTemplate } from "@langchain/core/prompts"

export class LLMService {
  private model: Ollama
  constructor () {
    this.model = new Ollama({
      model: 'deepseek-r1:8b',
      temperature: 0,
      maxRetries: 2,
      baseUrl: 'http://localhost:11434'
    })
  }

  async translateSentence(sentence: string) {
    const prompt = PromptTemplate.fromTemplate(
      "translate the following sentence to english: {sentence}"
    )

    const chain = prompt.pipe(this.model)
    const stream = await chain.stream({
      sentence
    })
    return stream
  }

}