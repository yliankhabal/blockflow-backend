import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';

import { initApi, initDocs } from './app.initializer';
import { AppModule } from './app.module';
import { getConfig } from './config';
import { setupCors } from './setup-cors';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const { port } = getConfig();

  app.useWebSocketAdapter(new IoAdapter(app));
  setupCors(app);
  initApi(app);
  initDocs(app);

  await app.listen(port);
  console.log(`\n Server running on http://localhost:${port}/api`);
  console.log(` Swagger docs at http://localhost:${port}/api/docs\n`);
}

bootstrap();
