import { AuditsService } from './audits.service';
export declare class AuditsController {
    private svc;
    constructor(svc: AuditsService);
    invite(body: {
        requirementId: string;
        vendorIds: string[];
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
    }[]>;
    findAll(vendorId?: string, requirementId?: string): Promise<({
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
    findOne(id: string): Promise<{
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
    respond(id: string, status: 'ACCEPTED' | 'REJECTED'): Promise<{
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
    shareSpoc(id: string, body: any): Promise<{
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
    submitReport(id: string, body: any, req: any, photos: Express.Multer.File[]): Promise<{
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
