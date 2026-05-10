import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional } from 'class-validator';

export class CreateJobDto {
  @ApiPropertyOptional({
    description: 'Optional metadata passed to the pipeline',
    example: { input: 'sample-data' },
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
