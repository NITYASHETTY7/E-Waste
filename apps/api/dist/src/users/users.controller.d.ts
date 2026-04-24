import { UsersService } from './users.service';
import { UserRole } from '@prisma/client';
export declare class UsersController {
    private usersService;
    constructor(usersService: UsersService);
    findOne(id: string): Promise<any>;
    updateRole(id: string, role: UserRole): Promise<{
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
    linkCompany(id: string, companyId: string): Promise<{
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
