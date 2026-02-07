import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthOtpTokenModule } from 'src/services/auth-otp-token/auth-otp-token.module';
import { PrismaService } from 'src/services/prisma/prisma.service';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './strategies/GoogleStrategy';

@Module({
  imports:[AuthOtpTokenModule,JwtModule.register({
    global:true,
    secret:process.env.JWT_SECRET,
    signOptions:{
      expiresIn:process.env.JWT_EXPIRES
    }

    
  }),
    PassportModule.register({ defaultStrategy: 'google' })
    //  PassportModule.register({ session: false }),
],
  controllers: [AuthController],
  providers: [AuthService,PrismaService,GoogleStrategy],
})
export class AuthModule {}
