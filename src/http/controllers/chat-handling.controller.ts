import { ProcessChatMessageUseCase } from "@application/use-cases/processChatMessage.usecase";
import { logger } from "@utils/logger.utils";
import { Request, Response } from "express";
import { pipeline, Readable } from "node:stream";
export class ChatHandlingController {
  constructor(
    private processChatMessageUseCase = new ProcessChatMessageUseCase()
  ) {}

  async processQuestion(request: Request, response: Response) {
    const { question } = request.query;

    if (!question) {
      response.status(400).json({
        message: "missing question params!",
      });
      return;
    }
    const value = question.toString();
    logger.info(`Processing question: ${value}`);
    const { stream } = await this.processChatMessageUseCase.execute(
      question.toString()
    );

    if (response.writable) {
      response.setHeader("Content-Type", "text/plain");
      response.setHeader("Transfer-Encoding", "chunked");

      pipeline(Readable.from(stream as any), response, (error) => {
        if (error) {
          logger.error(`error streaming response: ${error.message}`);
        }
        response.end();
      });
    } else {
      response.status(500).json({
        message: "could not write stream",
      });
    }
  }
}
