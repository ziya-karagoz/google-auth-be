import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: 'http://localhost:5173',
      credentials: true,
    });
  }

  await app.listen(3000);
}
bootstrap();
