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

  @Get()
  findAll() {
    return this.authOtpTokenService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authOtpTokenService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthOtpTokenDto: UpdateAuthOtpTokenDto) {
    return this.authOtpTokenService.update(+id, updateAuthOtpTokenDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authOtpTokenService.remove(+id);
  }
}
