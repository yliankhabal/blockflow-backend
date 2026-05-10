import { Injectable, Logger } from '@nestjs/common';

import { TIME } from '@app/common';
import { wait } from '@app/common/utils';
import { JobsRepository } from '@repositoryModule';

import { PipelineStep } from '../pipeline-step.interface';

@Injectable()
export class ValidateInputStep implements PipelineStep {
  readonly name = 'validate-input';
  private readonly logger = new Logger(ValidateInputStep.name);

  constructor(private readonly jobsRepository: JobsRepository) {}

  async execute(jobId: string): Promise<void> {
    this.logger.log(`[${jobId}] Running step: ${this.name}`);
    await wait(TIME.MINUTE * 3);
    await this.jobsRepository.update(jobId, { progress: 33 });
  }
}
