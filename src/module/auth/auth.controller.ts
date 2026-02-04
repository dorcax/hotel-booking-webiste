import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  loginDto,
  registerDto,
  userEntity,
  verifyEmailDto,
} from './auth.types';
import { GoogleAuthGuard } from './guard/GoogleAuthGuard';
import { Auth, AuthUser } from './deocorator/auth.decorator';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  @Post('signup')
  createUser(@Body() dto: registerDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  loginUser(@Body() dto: loginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('verify-otp')
  verifyOtp(@Body() dto: verifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Auth()
  @Get()
  async authUser(@AuthUser() user: userEntity) {
    return this.authService.authUser(user);
  }

  // google login
  @Get('google/login')
  @UseGuards(GoogleAuthGuard)
  async handleLogin() {
    // return await this.authService.handleLogin()
    return { message: 'google authentication' };
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async redirect(@Req() req, @Res() res) {
    const user = req.user;
    const payload = { sub: user.id, role: user.role };
    const token = await this.jwtService.signAsync(payload);

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 24 * 60 * 60 * 1000,
    });

    const frontendUrl = process.env.FRONTEND_URL;

    // Option 1: Redirect with token in query (for SPA frontends)
    return res.redirect(`${frontendUrl}/`);
    // return {message:"user redirect"}
  }
}
