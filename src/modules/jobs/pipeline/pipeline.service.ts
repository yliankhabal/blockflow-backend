import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Job } from '@prisma/client';

import { JobsRepository } from '@repositoryModule';

import { JobStatus } from '../enums/job-status.enum';
import { JOB_EVENTS } from '../jobs.events';

import { PipelineStep } from './pipeline-step.interface';
import { GenerateOutputStep } from './steps/generate-output.step';
import { TransformDataStep } from './steps/transform-data.step';
import { ValidateInputStep } from './steps/validate-input.step';

@Injectable()
export class PipelineService {
  private readonly logger = new Logger(PipelineService.name);
  private readonly steps: PipelineStep[];

  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly eventEmitter: EventEmitter2,
    private readonly validateInputStep: ValidateInputStep,
    private readonly transformDataStep: TransformDataStep,
    private readonly generateOutputStep: GenerateOutputStep,
  ) {
    this.steps = [validateInputStep, transformDataStep, generateOutputStep];
  }

  async run(job: Job): Promise<void> {
    let current = await this.jobsRepository.update(job.id, { status: JobStatus.PROCESSING });
    this.eventEmitter.emit(JOB_EVENTS.UPDATED, current);

    try {
      for (const step of this.steps) {
        this.logger.log(`[${job.id}] Executing step: ${step.name}`);
        await step.execute(job.id);
        current = await this.jobsRepository.findById(job.id);
        this.eventEmitter.emit(JOB_EVENTS.UPDATED, current);
      }

      current = await this.jobsRepository.update(job.id, {
        status: JobStatus.DONE,
        progress: 100,
        result: { success: true, processedAt: new Date().toISOString() },
      });
      this.eventEmitter.emit(JOB_EVENTS.UPDATED, current);
    } catch (error) {
      this.logger.error(`[${job.id}] Pipeline failed: ${(error as Error).message}`);
      current = await this.jobsRepository.update(job.id, { status: JobStatus.FAILED });
      this.eventEmitter.emit(JOB_EVENTS.UPDATED, current);
    }
  }
}
