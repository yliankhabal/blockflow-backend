import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { PrismaService } from '@modules/database';

import { JobsRepository } from './repositories';

const providers = [ConfigService, PrismaService, JobsRepository];

@Global()
@Module({
  providers,
  exports: providers,
})
export class RepositoryModule {}
