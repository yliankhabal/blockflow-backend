import { Injectable, NotFoundException } from '@nestjs/common';
import { Job, Prisma } from '@prisma/client';

import { JobsRepository } from '@repositoryModule';

import { CreateJobDto } from './dto';
import { PipelineService } from './pipeline/pipeline.service';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsRepository: JobsRepository,
    private readonly pipelineService: PipelineService,
  ) {}

  async create(dto: CreateJobDto): Promise<Job> {
    const job = await this.jobsRepository.create({ metadata: dto.metadata as Prisma.InputJsonValue });
    this.pipelineService.run(job);
    return job;
  }

  async findById(id: string): Promise<Job> {
    const job = await this.jobsRepository.findById(id);
    if (!job) throw new NotFoundException(`Job ${id} not found`);
    return job;
  }
}
