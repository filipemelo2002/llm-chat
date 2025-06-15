import { JobQueuerServiceFactory } from "@services/job-queuer.service";
import { ProcessAndEmbedFileUseCase } from "./processAndEmbedFile.usecase";

export class QueueEmbedingProcessUseCase {
  constructor(
    private jobQueuerService = new JobQueuerServiceFactory<{
      fileName: string;
    }>(new ProcessAndEmbedFileUseCase())
  ) {}

  async execute({ filename }: { filename: string }) {
    const jobId = await this.jobQueuerService.queueProcess({
      data: { fileName: filename },
      jobName: "embed-file",
    });
    return {
      id: jobId,
    };
  }
}
