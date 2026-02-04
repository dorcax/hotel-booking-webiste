import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
dotenv.config()
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser())
  app.enableCors({
     origin: ['http://localhost:5173',"https://haven-hotel.netlify.app"], // your React/Vite app
    credentials: true,
  })
  
  app.useGlobalPipes(new ValidationPipe({
    transform:true,
    whitelist:true,
    forbidNonWhitelisted: true,
  }))
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
