import { logger } from "@utils/logger.utils";
import { ConnectionOptions, Job, Queue, Worker } from "bullmq";
import { QueuerService } from "./services.types";
import RedisSingleton from "./redis-connection.service";
import Redis from "ioredis";

export const QUEUE_NAME = "ProcessQueue";

export class BullMQService<R> implements QueuerService {
  private queue: Queue;
  constructor(
    private queueName: string = QUEUE_NAME,
    private redisClient: Redis = RedisSingleton.getClient()
  ) {
    this.queue = new Queue(queueName, { connection: this.redisClient.duplicate() });
  }

  async addJob({ jobName, data }: { jobName: string; data: R }) {
    const response = await this.queue.add(jobName, data);
    return response.id;
  }

  startWorker(processor: (job: Job<R>) => Promise<void>) {
    const worker = new Worker(this.queueName, processor, {
      autorun: true,
      connection: this.redisClient.duplicate(),
    });
    worker.on("failed", (job, err) => {
      logger.error(err)
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
