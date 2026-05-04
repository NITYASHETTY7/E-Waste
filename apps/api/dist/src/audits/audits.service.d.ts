import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { NotificationService } from '../notifications/notification.service';
export declare class AuditsService {
    private prisma;
    private s3;
    private notifications;
    constructor(prisma: PrismaService, s3: S3Service, notifications: NotificationService);
    inviteVendors(requirementId: string, vendorIds: string[]): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AuditStatus;
        requirementId: string;
        vendorId: string;
        siteAddress: string | null;
        spocName: string | null;
        spocPhone: string | null;
        scheduledAt: Date | null;
    }[]>;
    findAllInvitations(vendorId?: string, requirementId?: string): Promise<({
        requirement: {
            client: {
                id: string;
                name: string;
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
                bankAccountHolder: string | null;
                bankName: string | null;
                bankAccountNumber: string | null;
                bankIfscCode: string | null;
                bankAccountType: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.RequirementStatus;
            title: string;
            description: string | null;
            rawS3Key: string | null;
            processedS3Key: string | null;
            targetPrice: number | null;
            totalWeight: number | null;
            category: string | null;
            invitedVendorIds: string[];
            sealedPhaseStart: Date | null;
            sealedPhaseEnd: Date | null;
            adminApprovedAt: Date | null;
            adminApprovedById: string | null;
            clientId: string;
        };
        vendor: {
            id: string;
            name: string;
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
            bankAccountHolder: string | null;
            bankName: string | null;
            bankAccountNumber: string | null;
            bankIfscCode: string | null;
            bankAccountType: string | null;
        };
        report: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            invitationId: string;
            productMatch: boolean | null;
            remarks: string | null;
            completedAt: Date | null;
            vendorUserId: string | null;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AuditStatus;
        requirementId: string;
        vendorId: string;
        siteAddress: string | null;
        spocName: string | null;
        spocPhone: string | null;
        scheduledAt: Date | null;
    })[]>;
    findOneInvitation(id: string): Promise<{
        requirement: {
            client: {
                id: string;
                name: string;
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
                bankAccountHolder: string | null;
                bankName: string | null;
                bankAccountNumber: string | null;
                bankIfscCode: string | null;
                bankAccountType: string | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.RequirementStatus;
            title: string;
            description: string | null;
            rawS3Key: string | null;
            processedS3Key: string | null;
            targetPrice: number | null;
            totalWeight: number | null;
            category: string | null;
            invitedVendorIds: string[];
            sealedPhaseStart: Date | null;
            sealedPhaseEnd: Date | null;
            adminApprovedAt: Date | null;
            adminApprovedById: string | null;
            clientId: string;
        };
        vendor: {
            id: string;
            name: string;
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
            bankAccountHolder: string | null;
            bankName: string | null;
            bankAccountNumber: string | null;
            bankIfscCode: string | null;
            bankAccountType: string | null;
        };
        report: ({
            photos: {
                id: string;
                s3Key: string;
                s3Bucket: string;
                fileName: string;
                mimeType: string | null;
                uploadedAt: Date;
                auditReportId: string;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            invitationId: string;
            productMatch: boolean | null;
            remarks: string | null;
            completedAt: Date | null;
            vendorUserId: string | null;
        }) | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AuditStatus;
        requirementId: string;
        vendorId: string;
        siteAddress: string | null;
        spocName: string | null;
        spocPhone: string | null;
        scheduledAt: Date | null;
    }>;
    respondToInvitation(id: string, status: 'ACCEPTED' | 'REJECTED'): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AuditStatus;
        requirementId: string;
        vendorId: string;
        siteAddress: string | null;
        spocName: string | null;
        spocPhone: string | null;
        scheduledAt: Date | null;
    }>;
    shareSpoc(id: string, data: {
        siteAddress: string;
        spocName: string;
        spocPhone: string;
        scheduledAt: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.AuditStatus;
        requirementId: string;
        vendorId: string;
        siteAddress: string | null;
        spocName: string | null;
        spocPhone: string | null;
        scheduledAt: Date | null;
    }>;
    submitReport(invitationId: string, data: {
        productMatch: boolean;
        remarks?: string;
        vendorUserId: string;
        photos?: Express.Multer.File[];
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        invitationId: string;
        productMatch: boolean | null;
        remarks: string | null;
        completedAt: Date | null;
        vendorUserId: string | null;
    }>;
}
