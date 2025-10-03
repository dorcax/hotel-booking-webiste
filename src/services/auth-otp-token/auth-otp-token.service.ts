import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAuthOtpTokenDto, VerifyOtp } from './dto/create-auth-otp-token.dto';
import { UpdateAuthOtpTokenDto } from './dto/update-auth-otp-token.dto';
import { generateOtp } from 'src/utils/generateOtp';
import { v4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { VerificationDto } from '../mail/mail.types';
import { bad } from 'src/utils/error';
import { isAfter } from 'date-fns';
import { connect } from 'http2';

@Injectable()
export class AuthOtpTokenService {
  constructor(private readonly prisma: PrismaService) {}

  async findCode(code: string) {
    return this.prisma.authOtpToken.findUnique({
      where: {
        code,
      },
    });
  }

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
    })
    return otp;
  }

  // verify otp
  async verityOtp(dto:VerifyOtp,allowDelete:boolean=true) {
    // find if the otp exist  in the database
    const { code ,subject} = dto;
    const token = await this.prisma.authOtpToken.findUnique({
      where: {
        code,
        subject
      },
    });
    if (!token) {
      bad('invalid token');
      return;
    }

    // check if it have not expired
    const isExpired = isAfter(new Date(), token.expiry);
    // delete the token if it have expired
    if (isExpired) {
      await this.deleteOtp(token.id);
      return false
    }
    if(allowDelete){
      await this.deleteOtp(token.id)
    }
    return true;
  }

  async deleteOtp(id: string) {
    return await this.prisma.authOtpToken.delete({
      where: {
        id,
      },
    });
  }
}
