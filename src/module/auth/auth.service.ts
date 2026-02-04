import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { JwtService } from '@nestjs/jwt';
import { AuthOtpTokenType } from '@prisma/client';
import * as argon2 from 'argon2';
import { addMinutes } from 'date-fns';
import { AuthOtpTokenService } from 'src/services/auth-otp-token/auth-otp-token.service';
import { Verification_Mail } from 'src/services/event/event.type';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { bad, mustHave } from 'src/utils/error';
import {
  Auth_Otp_Token_Subject,
  forgotPasswordDto,
  loginDto,
  registerDto,
  resetPasswordDto,
  userEntity,
  verifyEmailDto,
} from './auth.types';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authOtpTokenService: AuthOtpTokenService,
    private eventEmitter: EventEmitter2,
    private jwtService: JwtService,
  
  ) {}
  // check if user already exist before registering them
  async register(dto: registerDto) {
    const { name, email, password, gender, phoneNumber } = dto;
    // check if user already exist in the database
    const emailExist = await this.prisma.user.findUnique({
      where: { email },
    });
    if (emailExist) bad('email already exist');
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
        role:"GUEST",
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
  async login(dto: loginDto,res) {
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
    if (!user.auth) {
      bad('password is required');
    }
    if (!user.isVerified) {
      // send another code to their mail again
      return { isVerified: false };
    }
    // check if the password match
    const hashedPassword = user.auth.password;
    const matched = await argon2.verify(hashedPassword, password);
    if (!matched) bad('invalid credential');

    // jwt token
    const payload = { sub: user.id, role: user.role, };
    const token = await this.jwtService.signAsync(payload);
   
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV ==="production",
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });
    
    
    return {
      user: user.role,
      // hotelId:user.hotel?.id

    };
  }

  
  // verify the email
  async verifyEmail(dto: verifyEmailDto) {
    // check if the email exist
    const otp = await this.authOtpTokenService.findCode(dto.code);
    if (!otp) bad('invalid token');

    // verify the code
    const isVerified = await this.authOtpTokenService.verityOtp(
      {
        code: otp.code,
        subject: Auth_Otp_Token_Subject.Verify_Email,
      },
      false,
    );
    if (!isVerified) bad('otp verification failed');
    // update the user

    const user = await this.prisma.user.update({
      where: {
        email: otp.email,
      },
      data: {
        isVerified: true,
      },
    });
    await this.authOtpTokenService.deleteOtp(otp.id);
    return {
      message: 'email verified successfully ',
    };
  }

  // forget password oooo
  async forgotPassword(dto: forgotPasswordDto) {
    const { email } = dto;
    // find if the email exist
    const emailExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!emailExist) bad('invalid credentials');
    //  create token  to send
    const otpCode = await this.authOtpTokenService.create({
      userId: emailExist.id,
      type: AuthOtpTokenType.TOKEN,
      subject: 'forgot password',
      email: email,
      expiry: addMinutes(new Date(), 10),
    });
    const year = new Date().getFullYear();
    // listen to an event emitter
    const link = `${process.env.CLIENT_URL}/reset-password/${otpCode.code}`;
    await this.eventEmitter.emit(
      'verification_mail',
      new Verification_Mail(email,link, emailExist.name, year),
    );
  }

  // resend link
  async resendVerficationLink(dto: forgotPasswordDto) {
    const { email } = dto;
    const emailExist = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    if (!emailExist) bad('invalid credentials');
    if (emailExist.isVerified) bad('account already verified');

    await this.prisma.authOtpToken.deleteMany({
      where: {
        userId: emailExist.id,
      },
    });
    const otpCode = await this.authOtpTokenService.create({
      userId: emailExist.id,
      type: AuthOtpTokenType.OTP,
      subject: Auth_Otp_Token_Subject.Verify_Email,
      email: email,
      expiry: addMinutes(new Date(), 10),
    });
    // listen to an event emitter
    const year = new Date().getFullYear();
    await this.eventEmitter.emit(
      'verification_mail',
      new Verification_Mail(email, otpCode.code, emailExist.name, year),
    );
  }



  
  // reset password
  async resetPassword(dto: resetPasswordDto) {
    const { code, password, email } = dto;

    // find and verify the token
    const token = await this.authOtpTokenService.findCode(code);

    if (!token) bad('invalid token');

    const tokenIsValid = await this.authOtpTokenService.verityOtp(
      {
        code: token.code,
        subject: Auth_Otp_Token_Subject.RESET_PASSWORD,
      },
      false,
    );
    if (!tokenIsValid) bad('invalid token');

    const updateUserPassword = await this.prisma.user.update({
      where: {
        email: token.email,
      },
      data: {
        // password:await argon2.hash(password)
        auth: {
          update: {
            password: await argon2.hash(password),
          },
        },
      },
    });
    // delete the token
    await this.authOtpTokenService.deleteOtp(token.id);
    return {
      message: 'password reset successful',
    };
  }
  // find user 
  async authUser(user:userEntity){
    console.log("user",user)

    return await this.prisma.user.findUnique({
      where:{
        id:user.id
      },
    
    })

  } 
}
