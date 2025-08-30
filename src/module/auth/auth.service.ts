import { ConflictException, Injectable } from '@nestjs/common';
import { Auth_Otp_Token_Subject, loginDto, registerDto } from './auth.types';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { bad, mustHave } from 'src/utils/error';
import * as argon2 from 'argon2';
import { AuthOtpTokenService } from 'src/services/auth-otp-token/auth-otp-token.service';
import { addMinutes } from 'date-fns';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Verification_Mail } from 'src/services/event/event.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authOtpTokenService: AuthOtpTokenService,
    private eventEmitter: EventEmitter2,
  ) {}
  // check if user already exist before registering them
  async register(dto: registerDto) {
    const { name, email, password, gender, phoneNumber } = dto;
    // check if user already exist in the database
    const emailExist = await this.prisma.user.findUnique({
      where: { email },
    });
    if (emailExist) bad('eamil already exist');
    // check if phonenumber exist
    const phoneExist = await this.prisma.user.findUnique({
      where: { phoneNumber },
    });
    if (phoneExist) bad('phone number already exist');
    // create new user
    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        gender,
        phoneNumber,
        auth: {
          create: {
            password: await argon2.hash(password),
          },
        },
      },
    });
    // creating otp to verify email
    const otpGenerated = await this.authOtpTokenService.create({
      email: email,
      subject: Auth_Otp_Token_Subject.Verify_Email,
      userId: newUser.id,
      expiry: addMinutes(Date.now(), 10),
      type: 'OTP',
    });
    // LISTEN  TO THE EVENT
    const year = new Date().getFullYear();
    this.eventEmitter.emit(
      'verification_mail',
      new Verification_Mail(email, otpGenerated.code, name, year),
    );
    return {
      message: 'user successfully registered',
    };
  }

  // login in user

  async login(dto: loginDto) {
    const { email, password } = dto;
    // check if user exist in the database

    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
      select: {
        id: true,
        isVerified: true,
        role: true,
        auth: true,
      },
    });
    mustHave(user, 'invalid credentials', 401);
    if (!user.auth){
      bad('password is required')
     return};
    if (!user.isVerified) {
      // send another code to their mail again
      return { isVerified: false };
    }
    // check if the password match
    const hashedPassword = user.auth.password;
    const matched = await argon2.verify(hashedPassword, password);
    if(!matched) bad("invalid credential")

    // jwt token
    
}
}
