import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json, urlencoded } from 'express';
import basicAuth from 'express-basic-auth';
import * as swStats from 'swagger-stats';
import { SwaggerTheme, SwaggerThemeNameEnum } from 'swagger-themes';

export function initApi(app: NestExpressApplication) {
  app.use(json({ limit: process.env.BODY_LIMIT || '5mb' }));
  app.use(urlencoded({ extended: true, limit: process.env.BODY_LIMIT || '5mb' }));

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: false,
      validateCustomDecorators: true,
    }),
  );
}

export function initDocs(app: NestExpressApplication) {
  const DOCS_PATH = 'api/docs';
  const DOCS_USER = process.env.DOCS_USER || 'developer';
  const DOCS_PASSWORD = process.env.DOCS_PASSWORD || '123456';

  app.use(
    `/${DOCS_PATH}`,
    basicAuth({
      users: { [DOCS_USER]: DOCS_PASSWORD },
      challenge: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Job Processing API')
    .setDescription(
      'Async job processing pipeline with real-time WebSocket updates.\n\n' +
        '**WebSocket:** emit `subscribe` with `{ jobId }`, listen for `job:update`.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });

  app.use(
    swStats.getMiddleware({
      uriPath: `/${DOCS_PATH}/stats`,
      swaggerSpec: document,
      onAuthenticate: (_req, username, password) => username === DOCS_USER && password === DOCS_PASSWORD,
    }),
  );

  const theme = new SwaggerTheme();

  SwaggerModule.setup(DOCS_PATH, app, document, {
    customCss: theme.getBuffer(SwaggerThemeNameEnum.ONE_DARK),
    customSiteTitle: 'Job Processing API Docs',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      tagsSorter: 'alpha',
      tryItOutEnabled: true,
      defaultModelsExpandDepth: -1,
    },
  });
}
