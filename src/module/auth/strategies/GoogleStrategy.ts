import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { Role } from '@prisma/client';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly prisma: PrismaService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['email', 'profile'],
    
        //  accessType: 'offline',
      prompt: 'select_account',
    
    } as any);
    
    console.log('🚀 GoogleStrategy initialized!');
    console.log('Client ID present:', !!process.env.GOOGLE_CLIENT_ID);
    console.log('Callback URL:', 'http://localhost:3000/auth/google/callback');
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback
  ) {
    console.log('✅ GoogleStrategy.validate() called!');
    
    try {
      const email = profile.emails?.[0]?.value;

      if (!email) {
        // FIX: Use done() not throw
        return done(new Error('Google account has no email'));
      }

      console.log('Processing email:', email);

      let user = await this.prisma.user.findUnique({
        where: { email },
      });
    const uniquePhoneNumber = `google-oauth-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      if (!user) {
        console.log('Creating new user for:', email);
        user = await this.prisma.user.create({
          data: {
            name: `${profile.name?.givenName || ''} ${profile.name?.familyName || ''}`.trim(),
            email,
            isVerified: true,
            role: Role.GUEST,
            phoneNumber: uniquePhoneNumber,
            gender: 'FEMALE',
            auth: {
              create: {
                password: '',
              },
            },
          },
        });
      }

      console.log('✅ User authenticated:', user.email);
      return done(null, user);
      
    } catch (error) {
      console.error('❌ Error in GoogleStrategy.validate:', error);
      return done(error);
    }
  }
}