import { logger } from "@utils/logger.utils";
import { ConnectionOptions, Job, Queue, Worker } from "bullmq";
import { QueuerService } from "./services.types";

export const QUEUE_NAME = "ProcessQueue";

export class BullMQService<R> implements QueuerService {
  private queue: Queue;
  constructor(
    private queueName: string = QUEUE_NAME,
    private connection: ConnectionOptions = {
      host: process.env.REDIS_HOST ?? "127.0.0.1",
      port: Number(process.env.REDIS_PORT) ?? 6379,
    }
  ) {
    this.queue = new Queue(queueName, { connection });
  }

  async addJob({ jobName, data }: { jobName: string; data: R }) {
    const response = await this.queue.add(jobName, data);
    return response.id;
  }

  startWorker(processor: (job: Job<R>) => Promise<void>) {
    const worker = new Worker(this.queueName, processor, {
      autorun: true,
      connection: this.connection,
    });
    worker.on("failed", (job, err) => {
      logger.error(
        `[${job?.id}] Failed processing file: ${JSON.stringify(job?.data)}`
      );
    });

    worker.on("completed", (job) => {
      logger.info(
        `[${job.id}] Finished Processing file: ${JSON.stringify(job?.data)}`
      );
    });
  }
}
