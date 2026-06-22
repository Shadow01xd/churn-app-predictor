import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  const port = parseInt(process.env.API_PORT ?? '3000', 10) || 3000;
  await app.listen(port);
  console.log(`ChurnGuard API corriendo en http://localhost:${port}`);
}

bootstrap();
