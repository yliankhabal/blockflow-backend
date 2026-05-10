import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { LogHttp } from '@app/common';
import { getConfig } from '@app/config';
import { PrismaModule } from '@modules/database';
import { JobsModule } from '@modules/jobs/jobs.module';

import { RepositoryModule } from './modules/repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [getConfig] }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    RepositoryModule,
    JobsModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogHttp).forRoutes('*path');
  }
}
