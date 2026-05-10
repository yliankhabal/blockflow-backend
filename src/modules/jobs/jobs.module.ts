import { Module } from '@nestjs/common';

import { JobsRepository } from '@repositoryModule';

import { JobsController } from './jobs.controller';
import { JobsGateway } from './jobs.gateway';
import { JobsService } from './jobs.service';
import { PipelineService } from './pipeline/pipeline.service';
import { GenerateOutputStep } from './pipeline/steps/generate-output.step';
import { TransformDataStep } from './pipeline/steps/transform-data.step';
import { ValidateInputStep } from './pipeline/steps/validate-input.step';

@Module({
  controllers: [JobsController],
  providers: [
    JobsService,
    JobsGateway,
    JobsRepository,
    PipelineService,
    ValidateInputStep,
    TransformDataStep,
    GenerateOutputStep,
  ],
})
export class JobsModule {}
