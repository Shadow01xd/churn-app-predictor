import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS. En prod se restringe con CORS_ORIGIN (lista separada por comas).
  // En dev (sin CORS_ORIGIN, o con "*") se permite cualquier localhost/127.0.0.1.
  const corsEnv = process.env.CORS_ORIGIN?.trim();
  const allowList = corsEnv && corsEnv !== '*' ? corsEnv.split(',').map((o) => o.trim()) : null;
  app.enableCors({
    origin: allowList
      ? (origin, cb) => {
          if (!origin || allowList.includes(origin)) return cb(null, true);
          // tolera localhost <-> 127.0.0.1 en cualquier puerto durante el desarrollo
          if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
            return cb(null, true);
          }
          return cb(null, false);
        }
      : true,
  });

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('ChurnGuard API')
    .setDescription(
      'API de NestJS: auth y predicción de churn (delega la inferencia al microservicio FastAPI).',
    )
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = parseInt(process.env.API_PORT ?? '3000', 10) || 3000;
  await app.listen(port);
  console.log(`ChurnGuard API corriendo en http://localhost:${port}`);
  console.log(`Swagger UI en http://localhost:${port}/docs`);
}

bootstrap();
