import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './auth.dto';
import { OtpService } from './otp.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    private otpService;
    private prisma;
    constructor(usersService: UsersService, jwtService: JwtService, otpService: OtpService, prisma: PrismaService);
    register(dto: RegisterDto): Promise<{
        otp: {
            emailSent: boolean;
            phoneSent: boolean;
            devEmailOtp?: string;
            devPhoneOtp?: string;
        } | {
            emailSent: boolean;
            phoneSent: boolean;
        };
        resumed: boolean;
        resumeStep: number;
        access_token: string;
        user: any;
    } | {
        otp: {
            emailSent: boolean;
            phoneSent: boolean;
            devEmailOtp?: string;
            devPhoneOtp?: string;
        } | {
            emailSent: boolean;
            phoneSent: boolean;
        };
        access_token: string;
        user: any;
    }>;
    private computeResumeStep;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
    getProfile(userId: string): Promise<any>;
    markVerified(email: string, type: 'email' | 'phone'): Promise<void>;
    forgotPassword(email: string): Promise<{
        sent: boolean;
        devOtp?: string;
    }>;
    resetPassword(email: string, otp: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    private buildResponse;
}
