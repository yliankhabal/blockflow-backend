import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { JobsRepository } from '@repositoryModule';

import { JobStatus } from '../enums/job-status.enum';
import { JobsService } from '../jobs.service';
import { PipelineService } from '../pipeline/pipeline.service';

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

describe('JobsService', () => {
  let service: JobsService;
  let jobsRepository: { create: jest.Mock; findById: jest.Mock };
  let pipelineService: { run: jest.Mock };

  beforeEach(async () => {
    const job = makeJob();
    jobsRepository = {
      create: jest.fn().mockResolvedValue(job),
      findById: jest.fn().mockResolvedValue(job),
    };
    pipelineService = { run: jest.fn().mockResolvedValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: JobsRepository, useValue: jobsRepository },
        { provide: PipelineService, useValue: pipelineService },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
  });

  describe('create', () => {
    it('should call jobsRepository.create and return the job', async () => {
      const result = await service.create({});
      expect(result.id).toBe('test-uuid');
      expect(result.status).toBe(JobStatus.QUEUED);
      expect(jobsRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should call pipelineService.run with the created job (fire-and-forget)', async () => {
      await service.create({});
      expect(pipelineService.run).toHaveBeenCalledWith(expect.objectContaining({ id: 'test-uuid' }));
    });

    it('should return the job immediately without waiting for pipeline', async () => {
      pipelineService.run.mockReturnValue(new Promise(() => {})); // never resolves
      const result = await service.create({});
      expect(result.id).toBe('test-uuid');
    });
  });

  describe('findById', () => {
    it('should return the job when found', async () => {
      const result = await service.findById('test-uuid');
      expect(result.id).toBe('test-uuid');
      expect(jobsRepository.findById).toHaveBeenCalledWith('test-uuid');
    });

    it('should throw NotFoundException when job does not exist', async () => {
      jobsRepository.findById.mockResolvedValue(null);
      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundException);
    });

    it('should include the job id in the NotFoundException message', async () => {
      jobsRepository.findById.mockResolvedValue(null);
      await expect(service.findById('bad-id')).rejects.toThrow('bad-id');
    });
  });
});
