import { UserRole } from '@prisma/client';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    phone?: string;
}
export declare class LoginDto {
    email: string;
    password: string;
}
