import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import {
  DEFAULT_BACKEND_URL,
  DEFAULT_FRONTEND_URL,
  stripTrailingSlash,
} from './common/constants/app-urls';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const frontendUrl = stripTrailingSlash(
    process.env.FRONTEND_URL || DEFAULT_FRONTEND_URL,
  );
  const backendUrl = stripTrailingSlash(
    process.env.BACKEND_URL || DEFAULT_BACKEND_URL,
  );

  app.enableCors({
    origin: [frontendUrl, backendUrl, DEFAULT_FRONTEND_URL, DEFAULT_BACKEND_URL],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  app.use(cookieParser());

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);
}
bootstrap();
