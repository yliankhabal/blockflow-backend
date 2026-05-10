import { Injectable } from '@nestjs/common';
import { Job, Prisma } from '@prisma/client';

import { PrismaService } from '@modules/database';

@Injectable()
export class JobsRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data?: Prisma.JobCreateInput): Promise<Job> {
    return this.prisma.job.create({ data: data ?? {} });
  }

  findById(id: string): Promise<Job | null> {
    return this.prisma.job.findUnique({ where: { id } });
  }

  update(id: string, data: Prisma.JobUpdateInput): Promise<Job> {
    return this.prisma.job.update({ where: { id }, data });
  }
}
