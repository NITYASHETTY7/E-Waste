import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { RegisterDto, LoginDto } from './auth.dto';
export declare class AuthController {
    private authService;
    private otpService;
    constructor(authService: AuthService, otpService: OtpService);
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
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: any;
    }>;
    profile(req: any): Promise<any>;
    sendOtp(body: {
        email: string;
        phone?: string;
    }): Promise<{
        emailSent: boolean;
        phoneSent: boolean;
        devEmailOtp?: string;
        devPhoneOtp?: string;
    }>;
    verifyOtp(body: {
        email: string;
        code: string;
        type: 'email' | 'phone';
    }): Promise<{
        verified: boolean;
        message: string;
    }>;
    forgotPassword(body: {
        email: string;
    }): Promise<{
        sent: boolean;
        devOtp?: string;
    }>;
    resetPassword(body: {
        email: string;
        otp: string;
        newPassword: string;
    }): Promise<{
        success: boolean;
    }>;
}
