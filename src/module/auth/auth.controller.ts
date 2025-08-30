import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { loginDto, registerDto } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post("signup")
   createUser(@Body() dto:registerDto){
    
    return this.authService.register(dto)

    }
    loginUser(@Body() dto:loginDto){
      return this.authService.login(dto)

    }
}
