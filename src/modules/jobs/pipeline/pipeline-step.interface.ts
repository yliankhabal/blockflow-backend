export interface PipelineStep {
  readonly name: string;
  execute(jobId: string): Promise<void>;
}
