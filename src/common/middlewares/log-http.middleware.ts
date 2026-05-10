import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class LogHttp implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: () => void) {
    const requestId = crypto.randomUUID();
    const startTime = Date.now();

    res.once('finish', () => {
      const responseTime = ((Date.now() - startTime) / 1000).toFixed(3);
      const { method, url } = req;
      const { statusCode } = res;

      const msg = `[${requestId}] ${method} ${url} ${statusCode} ${responseTime}s`;
      if (statusCode >= 400) this.logger.error(msg);
      else this.logger.log(msg);
    });

    next();
  }
}
