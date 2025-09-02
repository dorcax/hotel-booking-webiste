import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthOtpTokenService } from './auth-otp-token.service';
import { CreateAuthOtpTokenDto } from './dto/create-auth-otp-token.dto';
import { UpdateAuthOtpTokenDto } from './dto/update-auth-otp-token.dto';

@Controller('auth-otp-token')
export class AuthOtpTokenController {
  constructor(private readonly authOtpTokenService: AuthOtpTokenService) {}

  @Post()
  create(@Body() createAuthOtpTokenDto: CreateAuthOtpTokenDto) {
    return this.authOtpTokenService.create(createAuthOtpTokenDto);
  }

  
 
}
