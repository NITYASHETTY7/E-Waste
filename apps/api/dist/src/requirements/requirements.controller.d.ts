import { RequirementsService } from './requirements.service';
export declare class RequirementsController {
    private svc;
    constructor(svc: RequirementsService);
    create(body: any, file: Express.Multer.File, req: any): Promise<{
        client: {
            id: string;
            status: import("@prisma/client").$Enums.CompanyStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CompanyType;
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
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RequirementStatus;
        rawS3Key: string | null;
        processedS3Key: string | null;
        targetPrice: number | null;
        totalWeight: number | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
    }>;
    findAll(clientId?: string): Promise<({
        auction: {
            id: string;
            title: string;
            description: string | null;
            status: import("@prisma/client").$Enums.AuctionStatus;
            targetPrice: number | null;
            category: string;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            basePrice: number;
            tickSize: number;
            maxTicks: number;
            extensionMinutes: number;
            sealedPhaseStart: Date | null;
            sealedPhaseEnd: Date | null;
            openPhaseStart: Date | null;
            openPhaseEnd: Date | null;
            extensionCount: number;
            winnerId: string | null;
            requirementId: string | null;
            quoteApproved: boolean | null;
            quoteRemarks: string | null;
        } | null;
        auditInvitations: {
            id: string;
            status: import("@prisma/client").$Enums.AuditStatus;
            createdAt: Date;
            updatedAt: Date;
            requirementId: string;
            vendorId: string;
            siteAddress: string | null;
            spocName: string | null;
            spocPhone: string | null;
            scheduledAt: Date | null;
        }[];
        client: {
            users: {
                id: string;
            }[];
        } & {
            id: string;
            status: import("@prisma/client").$Enums.CompanyStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CompanyType;
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
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RequirementStatus;
        rawS3Key: string | null;
        processedS3Key: string | null;
        targetPrice: number | null;
        totalWeight: number | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
    })[]>;
    findOne(id: string): Promise<{
        auction: {
            id: string;
            title: string;
            description: string | null;
            status: import("@prisma/client").$Enums.AuctionStatus;
            targetPrice: number | null;
            category: string;
            createdAt: Date;
            updatedAt: Date;
            clientId: string;
            basePrice: number;
            tickSize: number;
            maxTicks: number;
            extensionMinutes: number;
            sealedPhaseStart: Date | null;
            sealedPhaseEnd: Date | null;
            openPhaseStart: Date | null;
            openPhaseEnd: Date | null;
            extensionCount: number;
            winnerId: string | null;
            requirementId: string | null;
            quoteApproved: boolean | null;
            quoteRemarks: string | null;
        } | null;
        auditInvitations: ({
            vendor: {
                id: string;
                status: import("@prisma/client").$Enums.CompanyStatus;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                type: import("@prisma/client").$Enums.CompanyType;
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
            status: import("@prisma/client").$Enums.AuditStatus;
            createdAt: Date;
            updatedAt: Date;
            requirementId: string;
            vendorId: string;
            siteAddress: string | null;
            spocName: string | null;
            spocPhone: string | null;
            scheduledAt: Date | null;
        })[];
        client: {
            id: string;
            status: import("@prisma/client").$Enums.CompanyStatus;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: import("@prisma/client").$Enums.CompanyType;
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
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RequirementStatus;
        rawS3Key: string | null;
        processedS3Key: string | null;
        targetPrice: number | null;
        totalWeight: number | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
    }>;
    uploadProcessed(id: string, file: Express.Multer.File): Promise<{
        id: string;
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RequirementStatus;
        rawS3Key: string | null;
        processedS3Key: string | null;
        targetPrice: number | null;
        totalWeight: number | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
    }>;
    clientApprove(id: string, body: any): Promise<{
        id: string;
        title: string;
        description: string | null;
        status: import("@prisma/client").$Enums.RequirementStatus;
        rawS3Key: string | null;
        processedS3Key: string | null;
        targetPrice: number | null;
        totalWeight: number | null;
        category: string | null;
        createdAt: Date;
        updatedAt: Date;
        clientId: string;
    }>;
    getSignedUrl(id: string, field: 'raw' | 'processed'): Promise<{
        url: string;
    }>;
}
