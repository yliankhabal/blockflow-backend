import { Prisma } from '@prisma/client';

import { JobStatus } from '../../enums/job-status.enum';

export interface MockJob {
  id: string;
  status: JobStatus;
  progress: number;
  metadata: Prisma.JsonValue;
  result: Prisma.JsonValue;
  createdAt: Date;
  updatedAt: Date;
}
