import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { TaskSchedule } from './task-schedule';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [TaskSchedule],
})
export class TaskScheduleModule {}
