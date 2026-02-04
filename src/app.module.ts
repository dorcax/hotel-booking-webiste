import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './module/auth/auth.module';
import { PropertyModule } from './module/property/property.module';
import { RoomModule } from './module/room/room.module';
import { UploadModule } from './module/upload/upload.module';
import { AuthOtpTokenModule } from './services/auth-otp-token/auth-otp-token.module';
import { EventModule } from './services/event/event.module';
import { FlutterwaveModule } from './services/flutterwave/flutterwave.module';
import { MailModule } from './services/mail/mail.module';
import { PrismaModule } from './services/prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal:true

    }),
    
    PrismaModule, AuthOtpTokenModule,AuthModule,RoomModule, EventModule, MailModule, FlutterwaveModule,UploadModule, PropertyModule],
  controllers: [AppController],
  
  providers: [AppService],

})
export class AppModule {}
