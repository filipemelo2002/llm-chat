import { ProcessAndEmbedFileUseCase } from "@application/use-cases/processAndEmbedFile.usecase";
import { Job, Worker,  Queue } from "bullmq";

const connection = {
  host: '127.0.0.1',
  port: 6379
}

export const QUEUE_NAME = "ProcessQueue"
export const ProcessQueue = new Queue(QUEUE_NAME, {connection})
export const queueProcess = async (fileName: string) => {
  const response = await ProcessQueue.add("embed-file", {fileName})
  return response.id
}

export const worker = new Worker(QUEUE_NAME, async (job: Job<{fileName: string}>) => {
  const processAndEmbedFile = new ProcessAndEmbedFileUseCase()
  console.log("Initializing queue for file: "+job.data.fileName)
  await processAndEmbedFile.exectute(job.data.fileName)
}, {
  autorun: true,
  connection
})

worker.on("failed", (job, err) => {
  console.log(JSON.stringify(err));
});
