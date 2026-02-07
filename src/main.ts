import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
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


  const config = new DocumentBuilder()
  .setTitle('Property Management System API')
  .setDescription(`
    A Property Management System API built with NestJS.

    Authentication:
    - Uses HTTP-only cookies for JWT authentication.
    - After login, JWT is stored in a secure cookie.
    - Protected routes require authenticated session.

    Roles:
    - Admin
    - Host
    - Guest
  `)
  .setVersion('1.0')
  .addCookieAuth('Authentication') 
  .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
