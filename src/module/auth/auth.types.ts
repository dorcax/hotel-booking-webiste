import { IsEmail, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';

export const Auth_Otp_Token_Subject = {
  Verify_Email: 'verify email',
  RESET_PASSWORD: 'RESET Password',
};

// register dto 

export class registerDto {
  @ApiProperty({
    example: 'eniola ibrahim',
    description: 'Full name of the user',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'eniolaibrahim@gmail.com',
    description: 'Valid email address of the user',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '+2348012345678',
    description: 'Phone number of the user',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'Male',
    description: 'Gender of the user',
  })
  @IsString()
  gender: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description: 'Password for the account',
  })
  @IsString()
  password: string;
}

// login dto

export class loginDto {
  @ApiProperty({
    example: 'eniolaibrahim@gmail.com',
    description: 'Registered email address',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPassword123',
    description: 'Account password',
  })
  @IsString()
  password: string;
}

// verify email dto

export class verifyEmailDto {
  @ApiProperty({
    example: '482913',
    description: 'OTP code sent to the user email for verification',
  })
  @IsString()
  code: string;
}

// reset password dto

export class resetPasswordDto {
  @ApiProperty({
    example: '482913',
    description: 'OTP code sent for password reset',
  })
  @IsString()
  code: string;

  @ApiProperty({
    example: 'NewStrongPassword123',
    description: 'New password to replace the old one',
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address associated with the account',
  })
  @IsString()
  email: string;
}

// forgot password dto

export class forgotPasswordDto {
  @ApiProperty({
    example: 'john@example.com',
    description: 'Email address to receive password reset OTP',
  })
  @IsEmail()
  email: string;
}

// user entity

export class userEntity {
  @ApiProperty({
    example: 'clx9abc123xyz',
    description: 'Unique identifier of the user',
  })
  id: string;

  @ApiProperty({
    enum: Role,
    example: Role.ADMIN,
    description: 'Role assigned to the user (Admin, Landlord, Tenant)',
  })
  role: Role;

  @ApiProperty({
    example: 'john@example.com',
    description: 'User email address',
  })
  email: string;

  @ApiPropertyOptional({
    example: 'hotel_12345',
    description: 'Associated hotel ID if applicable',
  })
  hotelId?: string;
}
