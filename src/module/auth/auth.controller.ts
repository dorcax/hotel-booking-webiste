import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, registerDto } from './auth.types';
import { GoogleAuthGuard } from './guard/GoogleAuthGuard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("signup")
   createUser(@Body() dto:registerDto){
    
    return this.authService.register(dto)

    }

    @Post("login")
    loginUser(@Body() dto:loginDto){
      return this.authService.login(dto)

    }

    // google login 
    @Get("google/login")
    @UseGuards(GoogleAuthGuard)
    async handleLogin(){
      // return await this.authService.handleLogin()
      return {message:"google authentication"}
    }


    @Get("google/callback")
    @UseGuards(GoogleAuthGuard)
    async redirect(){
      return {message:"user redirect"}
    }

}
