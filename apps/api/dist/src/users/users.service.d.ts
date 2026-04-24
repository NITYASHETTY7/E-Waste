import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<({
        company: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import("@prisma/client").$Enums.CompanyType;
            status: import("@prisma/client").$Enums.CompanyStatus;
            gstNumber: string | null;
            panNumber: string | null;
            address: string | null;
            city: string | null;
            state: string | null;
            pincode: string | null;
            rating: number | null;
            ratingCount: number;
        } | null;
    } & {
        name: string;
        id: string;
        email: string;
        passwordHash: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        companyId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }) | null>;
    findById(id: string): Promise<any>;
    create(data: {
        email: string;
        name: string;
        passwordHash: string;
        role?: string;
    }): Promise<{
        name: string;
        id: string;
        email: string;
        passwordHash: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        companyId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    linkToCompany(userId: string, companyId: string): Promise<{
        name: string;
        id: string;
        email: string;
        passwordHash: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        companyId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateRole(userId: string, role: UserRole): Promise<{
        name: string;
        id: string;
        email: string;
        passwordHash: string;
        phone: string | null;
        role: import("@prisma/client").$Enums.UserRole;
        companyId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
