import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto, LoginDto } from './auth.dto';
import { OtpService } from './otp.service';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyType } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private prisma: PrismaService,
  ) {}

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      email: dto.email,
      name: dto.name,
      passwordHash: hash,
      role: dto.role || 'USER',
      phone: dto.phone,
    });

    // For CLIENT and VENDOR roles, create a Company record with PENDING status
    const role = ((dto.role as string) || 'USER').toUpperCase();
    if (role === 'CLIENT' || role === 'VENDOR') {
      const company = await this.prisma.company.create({
        data: {
          name: dto.name,
          type: role as CompanyType,
          status: 'PENDING',
        },
      });
      await this.prisma.user.update({
        where: { id: user.id },
        data: { companyId: company.id },
      });
    }

    const otpResult = await this.otpService.sendOtp(dto.email, dto.phone).catch(() => ({ emailSent: false, phoneSent: false }));

    // Re-fetch user so companyId is included in the response
    const freshUser = await this.prisma.user.findUnique({ where: { id: user.id }, include: { company: true } });
    return { ...this.buildResponse(freshUser ?? user), otp: otpResult };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !dto.password) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.buildResponse(user);
  }

  async getProfile(userId: string) {
    return this.usersService.findById(userId);
  }

  async markVerified(email: string, type: 'email' | 'phone') {
    const user = await this.usersService.findByEmail(email);
    if (!user) return;

    const updateData = type === 'email' ? { emailVerified: true } : { phoneVerified: true };
    await this.prisma.user.update({ where: { id: user.id }, data: updateData });

    // Activate account once both email and phone are verified
    const fresh = await this.prisma.user.findUnique({ where: { id: user.id } });
    if (fresh?.emailVerified && fresh?.phoneVerified) {
      await this.prisma.user.update({ where: { id: user.id }, data: { isActive: true } });
    }
  }

  async forgotPassword(email: string): Promise<{ sent: boolean; devOtp?: string }> {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('No account found with that email address.');

    const result = await this.otpService.sendOtp(email);
    return { sent: result.emailSent || true, devOtp: result.devEmailOtp };
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<{ success: boolean }> {
    const verify = await this.otpService.verifyOtp(email, otp, 'email');
    if (!verify.verified) throw new BadRequestException(verify.message);

    const hash = await (await import('bcryptjs')).hash(newPassword, 10);
    await this.prisma.user.update({ where: { email }, data: { passwordHash: hash } });
    return { success: true };
  }

  private buildResponse(user: any) {
    const { passwordHash, ...safeUser } = user;
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      access_token: this.jwtService.sign(payload),
      user: safeUser,
    };
  }
}
