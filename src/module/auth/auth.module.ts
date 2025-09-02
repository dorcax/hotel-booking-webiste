import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { AuthOtpTokenModule } from 'src/services/auth-otp-token/auth-otp-token.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[AuthOtpTokenModule,JwtModule.register({
    global:true,
    secret:process.env.JWT_SECRET,
    signOptions:{
      expiresIn:process.env.JWT_EXPIRES
    }

  }),
],
  controllers: [AuthController],
  providers: [AuthService,PrismaService],
})
export class AuthModule {}
