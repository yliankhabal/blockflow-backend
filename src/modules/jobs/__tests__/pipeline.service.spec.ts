import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';

import { JobsRepository } from '@repositoryModule';

import { JobStatus } from '../enums/job-status.enum';
import { JOB_EVENTS } from '../jobs.events';
import { PipelineService } from '../pipeline/pipeline.service';
import { GenerateOutputStep } from '../pipeline/steps/generate-output.step';
import { TransformDataStep } from '../pipeline/steps/transform-data.step';
import { ValidateInputStep } from '../pipeline/steps/validate-input.step';

import { MockJob } from './interfaces/mock-job.interface';

const makeJob = (overrides: Partial<MockJob> = {}): MockJob => ({
  id: 'test-uuid',
  status: JobStatus.QUEUED,
  progress: 0,
  metadata: null,
  result: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('PipelineService', () => {
  let service: PipelineService;
  let jobsRepository: { update: jest.Mock; findById: jest.Mock };
  let eventEmitter: { emit: jest.Mock };
  let validateStep: { name: string; execute: jest.Mock };
  let transformStep: { name: string; execute: jest.Mock };
  let generateStep: { name: string; execute: jest.Mock };

  beforeEach(async () => {
    jobsRepository = {
      update: jest.fn().mockResolvedValue(makeJob()),
      findById: jest.fn().mockResolvedValue(makeJob()),
    };
    eventEmitter = { emit: jest.fn() };
    validateStep = { name: 'validate-input', execute: jest.fn().mockResolvedValue(undefined) };
    transformStep = { name: 'transform-data', execute: jest.fn().mockResolvedValue(undefined) };
    generateStep = { name: 'generate-output', execute: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelineService,
        { provide: JobsRepository, useValue: jobsRepository },
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: ValidateInputStep, useValue: validateStep },
        { provide: TransformDataStep, useValue: transformStep },
        { provide: GenerateOutputStep, useValue: generateStep },
      ],
    }).compile();

    service = module.get<PipelineService>(PipelineService);
  });

  it('should set status to PROCESSING at the start', async () => {
    await service.run(makeJob());
    expect(jobsRepository.update).toHaveBeenCalledWith('test-uuid', { status: JobStatus.PROCESSING });
  });

  it('should execute all three steps', async () => {
    await service.run(makeJob());
    expect(validateStep.execute).toHaveBeenCalledWith('test-uuid');
    expect(transformStep.execute).toHaveBeenCalledWith('test-uuid');
    expect(generateStep.execute).toHaveBeenCalledWith('test-uuid');
  });

  it('should execute steps in order: validate → transform → generate', async () => {
    await service.run(makeJob());
    const orders = [
      validateStep.execute.mock.invocationCallOrder[0],
      transformStep.execute.mock.invocationCallOrder[0],
      generateStep.execute.mock.invocationCallOrder[0],
    ];
    expect(orders[0]).toBeLessThan(orders[1]);
    expect(orders[1]).toBeLessThan(orders[2]);
  });

  it('should set status to DONE when all steps succeed', async () => {
    await service.run(makeJob());
    const calls: [string, Record<string, unknown>][] = jobsRepository.update.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[1]).toMatchObject({ status: JobStatus.DONE });
  });

  it('should set status to FAILED when a step throws', async () => {
    validateStep.execute.mockRejectedValueOnce(new Error('step failed'));
    await service.run(makeJob());
    const calls: [string, Record<string, unknown>][] = jobsRepository.update.mock.calls;
    const lastCall = calls[calls.length - 1];
    expect(lastCall[1]).toMatchObject({ status: JobStatus.FAILED });
  });

  it('should emit job.updated event at least once', async () => {
    await service.run(makeJob());
    expect(eventEmitter.emit).toHaveBeenCalledWith(JOB_EVENTS.UPDATED, expect.any(Object));
  });
});
