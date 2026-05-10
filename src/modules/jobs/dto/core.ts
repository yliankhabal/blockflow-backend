import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { JobStatus } from '../enums/job-status.enum';

export class JobDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  id: string;

  @ApiProperty({ enum: JobStatus, example: JobStatus.QUEUED })
  status: JobStatus;

  @ApiProperty({ example: 0, description: 'Progress percentage 0–100' })
  progress: number;

  @ApiPropertyOptional({ example: { input: 'sample-data' } })
  metadata: Record<string, unknown> | null;

  @ApiPropertyOptional({ example: { success: true } })
  result: Record<string, unknown> | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
