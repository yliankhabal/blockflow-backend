import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

import { getConfig } from '@app/config';

@Injectable()
export class TaskSchedule {
  private readonly logger = new Logger(TaskSchedule.name);

  @Cron(CronExpression.EVERY_MINUTE)
  async keepAlive() {
    const { port, base_url } = getConfig();

    try {
      await fetch(`http://${base_url}:${port}/api/health`);
      this.logger.log('Keep-alive ping sent');
    } catch {
      this.logger.warn('Keep-alive ping failed');
    }
  }
}
