import { ProcessChatMessageUseCase } from "@application/use-cases/processChatMessage.usecase";
import { logger } from "@utils/logger.utils";
import { Request, Response } from "express";
import { pipeline, Readable } from "node:stream";
export class ChatHandlingController {
  constructor(
    private processChatMessageUseCase = new ProcessChatMessageUseCase()
  ) {}

  async processQuestion(request: Request, response: Response) {
    const { question, sessionId } = request.query;

    if (!question || !sessionId) {
      response.status(400).json({
        message: "question & sessionId are mandatory!",
      });
      return;
    }

    const value = question.toString();
    const session = sessionId.toString();
    logger.info(`Processing question: [${sessionId}] ${value}`);
    const { response: answer } = await this.processChatMessageUseCase.execute({
      message: value,
      sessionId: session,
    });

    response.json({
      answer
    })
  }
}
