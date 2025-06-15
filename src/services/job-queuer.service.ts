import { UseCase } from "@application/use-cases/uses-cases.types";
import { QueuerService } from "./services.types";
import { BullMQService } from "./bullmq.service";

export class JobQueuerServiceFactory<R> {
  constructor(
    private useCaseService: UseCase,
    private queuerService: QueuerService = new BullMQService<R>()
  ) {
    this.initializeWorker();
  }

  private initializeWorker() {
    this.queuerService.startWorker((job) =>
      this.useCaseService.execute({ id: job.id, ...job.data })
    );
  }

  async queueProcess({ jobName, data }: { jobName: string; data: R }) {
    const processId = await this.queuerService.addJob({
      jobName,
      data,
    });
    return processId;
  }
}
