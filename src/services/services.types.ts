export interface QueuerService {
  addJob(request: any): Promise<any>;
  startWorker(processor: (job: any) => Promise<any>): void;
}
