import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { RegisterDto, LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private otpService: OtpService,
  ) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  profile(@Request() req: any) {
    return this.authService.getProfile(req.user.userId);
  }

  @Post('send-otp')
  async sendOtp(@Body() body: { email: string; phone?: string }) {
    return this.otpService.sendOtp(body.email, body.phone);
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; code: string; type: 'email' | 'phone' }) {
    // verifyOtp is now async and persists emailVerified/isActive to DB internally
    return await this.otpService.verifyOtp(body.email, body.code, body.type);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { email: string; otp: string; newPassword: string }) {
    return this.authService.resetPassword(body.email, body.otp, body.newPassword);
  }
}
