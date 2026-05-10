import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { LogHttp, TIME } from '@app/common';
import { getConfig } from '@app/config';
import { JobsModule, PrismaModule, TaskScheduleModule } from '@app/modules';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RepositoryModule } from './modules/repository';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [getConfig] }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: TIME.MINUTE * 5,
          limit: 50,
        },
      ],
    }),
    EventEmitterModule.forRoot(),
    ScheduleModule.forRoot(),
    PrismaModule,
    RepositoryModule,
    TaskScheduleModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LogHttp).forRoutes('*path');
  }
}
