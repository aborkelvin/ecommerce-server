import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import * as express from "express"
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true
  }))
  app.useGlobalInterceptors(
    new ClassSerializerInterceptor(app.get(Reflector))
  )
  app.enableCors()
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads' )))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
