import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { getConfig } from './config';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  onModuleInit() {
    const { port } = getConfig();
    const url = `http://localhost:${port}/api/health`;

    setInterval(async () => {
      try {
        await fetch(url);
        this.logger.log('Keep-alive ping sent');
      } catch {
        this.logger.warn('Keep-alive ping failed');
      }
    }, 60_000);
  }
}
