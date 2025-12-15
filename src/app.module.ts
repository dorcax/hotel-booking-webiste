import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './services/prisma/prisma.module';
import { AuthOtpTokenModule } from './services/auth-otp-token/auth-otp-token.module';
import { EventModule } from './services/event/event.module';
import { MailModule } from './services/mail/mail.module';
import { AuthModule } from './module/auth/auth.module';
import { FlutterwaveModule } from './services/flutterwave/flutterwave.module';
import { UploadModule } from './module/upload/upload.module';
import { HotelModule } from './module/hotel/hotel.module';
import { RoomModule } from './module/room/room.module';

@Module({
  imports: [PrismaModule, AuthOtpTokenModule,AuthModule,HotelModule,RoomModule, EventModule, MailModule, FlutterwaveModule,UploadModule],
  controllers: [AppController],
  
  providers: [AppService],

})
export class AppModule {}
