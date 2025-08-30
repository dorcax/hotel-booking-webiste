import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { AuthOtpTokenModule } from 'src/services/auth-otp-token/auth-otp-token.module';

@Module({
  imports:[AuthOtpTokenModule],
  controllers: [AuthController],
  providers: [AuthService,PrismaService],
})
export class AuthModule {}
