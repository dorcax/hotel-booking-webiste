import { Injectable } from '@nestjs/common';
import { CreateAuthOtpTokenDto } from './dto/create-auth-otp-token.dto';
import { UpdateAuthOtpTokenDto } from './dto/update-auth-otp-token.dto';
import { generateOtp } from 'src/utils/generateOtp';
import { v4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthOtpTokenService {
  constructor(private readonly prisma: PrismaService) {}
  async create(createAuthOtpTokenDto: CreateAuthOtpTokenDto) {
    const { subject, email, type, expiry, hotelId, userId } =
      createAuthOtpTokenDto;
    const code = type === 'OTP' ? generateOtp() : v4();
    //  create the token
    const otp = await this.prisma.authOtpToken.create({
      data: {
        subject,
        email,
        type,
        expiry,
        userId,
        hotelId,
        code,
      },
    });
    return otp;
  }

  findAll() {
    return `This action returns all authOtpToken`;
  }

  findOne(id: number) {
    return `This action returns a #${id} authOtpToken`;
  }

  update(id: number, updateAuthOtpTokenDto: UpdateAuthOtpTokenDto) {
    return `This action updates a #${id} authOtpToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} authOtpToken`;
  }
}
