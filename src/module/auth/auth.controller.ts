import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBody,
  ApiCookieAuth,
  ApiOperation,
  ApiResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import {
  loginDto,
  registerDto,
  userEntity,
  verifyEmailDto,
} from './auth.types';
import { Auth, AuthUser } from './deocorator/auth.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly jwtService: JwtService,
  ) {}
  @Post('signup')
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiBody({ type: registerDto })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({
    status: 400,
    description: 'Validation failed or email already exists',
  })
  createUser(@Body() dto: registerDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login user and set JWT in HTTP-only cookie',
    description: `
  Validates user credentials.
  If successful, a JWT token is generated and stored in an HTTP-only cookie named 'access_token'.
  `,
  })
  @ApiBody({ type: loginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful. Authentication cookie set.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  loginUser(@Body() dto: loginDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(dto, res);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'Verify user email using OTP code' })
  @ApiBody({ type: verifyEmailDto })
  @ApiResponse({ status: 200, description: 'Email verified successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired OTP' })
  verifyOtp(@Body() dto: verifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Auth()
  @Get()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Get currently authenticated user' })
  @ApiResponse({ status: 200, description: 'Authenticated user returned' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - No valid cookie found',
  })
  async authUser(@AuthUser() user: userEntity) {
    return this.authService.authUser(user);
  }

  @Get('google')
  @ApiOperation({
  summary: 'Initiate Google OAuth login',
  description: 'Redirects user to Google authentication page.',
})
  @UseGuards(AuthGuard('google'))
  // @UseGuards(GoogleAuthGuard)
  async googleLogin(@Req() req) {}

  @Get('google/callback')
  @ApiOperation({
    summary: 'Google OAuth callback',
    description: `
  Handles Google authentication callback.
  Generates JWT and stores it in HTTP-only cookie.
  Redirects user to frontend application.
  `,
  })
  @ApiResponse({
    status: 302,
    description: 'Redirects to frontend after successful authentication',
  })
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req, @Res() res) {
    const user = req.user;

    const token = await this.jwtService.signAsync({
      sub: user.id,
      role: user.role,
    });

    res.cookie('access_token', token, {
      httpOnly: true,
      secure: false, // change to true in production
      sameSite: 'lax', // IMPORTANT for localhost
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.redirect('http://localhost:5173');
  }

  // // google login
  // @Get('google/login')
  // @UseGuards(AuthGuard("google"))
  // async handleLogin() {
  //   // return await this.authService.handleLogin()
  //   // return { message: 'google authentication' };
  // }

  // @Get('google/callback')
  // @UseGuards(AuthGuard("google"))
  // async redirect(@Req() req, @Res() res) {
  //   const user = req.user;
  //   // const payload = { sub: user.id, role: user.role };
  //   // const token = await this.jwtService.signAsync(payload);

  //   // res.cookie('access_token', token, {
  //   //   httpOnly: true,
  //   //   secure: process.env.NODE_ENV === 'production',
  //   //   sameSite: 'none',
  //   //   maxAge: 24 * 60 * 60 * 1000,
  //   // });

  //   const frontendUrl = process.env.FRONTEND_URL;

  //   // Option 1: Redirect with token in query (for SPA frontends)
  //   return res.redirect(`${frontendUrl}/`);
  //   // return {message:"user redirect"}
  // }
}
