import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { Strategy, Profile, VerifyCallback, StrategyOptions, StrategyOptionsWithRequest } from 'passport-google-oauth20';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly jwtService:JwtService,
    private readonly prisma:PrismaService
  ) {

     const options: StrategyOptionsWithRequest = {
      clientID: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
    //   http://localhost:3000/auth/google/callback
      callbackURL: 'http://localhost:3000/auth/google/callback',
      scope: ['profile', 'email'],
      passReqToCallback:true
    };

    super(options);
    // super({
    //   clientID: process.env.GOOGLE_CLIENT_ID,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    //   callbackURL:'http://localhost:3000/auth/google/callback',
    //   scope: ['profile', 'email'],
    // });
  }

  async validate(
    req:Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    // This is where you handle what happens when Google sends back the user info
    const { name, emails, photos } = profile;

    // find if user already exist 
    let user =await this.prisma.user.findUnique({where:{email:emails?.[0]?.value}}) 
    

    
     let email =emails?.[0]?.value
     if (!email) {
  throw new Error('Google account has no email address.');
}

if(!user){
    user=await this.prisma.user.create({
        data:{
      
      name: `${name?.givenName}-${name?.familyName}`,
      email,
    auth:{
        create:{
            password:""
        }
    },
      isVerified:true,
      role:Role.CUSTOMER,
      phoneNumber:"",
      gender:"FEMALE"

        }
    })
  
}
   
    // const userh = {
    //   email: emails?.[0]?.value,
    //   firstName: name?.givenName,
    //   lastName: name?.familyName,
    //   picture: photos?.[0]?.value,
    //   accessToken,
    // };

    const payload = { sub: user.id, role: Role.CUSTOMER };
    const token = await this.jwtService.signAsync(payload);
   

    // Tell Passport we're done and pass the user data
     // Attach token to user data
    const userWithToken = { ...user, token };

    // ✅ Tell Passport we're done — return user + token
    done(null, userWithToken);
    // done(null, {user,token});
  }
}
