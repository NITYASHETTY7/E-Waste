import { PickupsService } from './pickups.service';
import { DocumentType, PickupStatus } from '@prisma/client';
export declare class PickupsController {
    private svc;
    constructor(svc: PickupsService);
    create(body: {
        auctionId: string;
        paymentId?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PickupStatus;
        auctionId: string;
        scheduledDate: Date | null;
        paymentId: string | null;
        adminNotes: string | null;
    }>;
    findAll(status?: PickupStatus): Promise<({
        auction: {
            client: {
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
            };
            winner: {
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.AuctionStatus;
            title: string;
            description: string | null;
            targetPrice: number | null;
            category: string;
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
        };
        pickupDocs: {
            id: string;
            type: import("@prisma/client").$Enums.DocumentType;
            s3Key: string;
            s3Bucket: string;
            fileName: string;
            mimeType: string | null;
            uploadedAt: Date;
            pickupId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PickupStatus;
        auctionId: string;
        scheduledDate: Date | null;
        paymentId: string | null;
        adminNotes: string | null;
    })[]>;
    findOne(id: string): Promise<{
        pickupDocs: {
            signedUrl: string;
            id: string;
            type: import("@prisma/client").$Enums.DocumentType;
            s3Key: string;
            s3Bucket: string;
            fileName: string;
            mimeType: string | null;
            uploadedAt: Date;
            pickupId: string;
        }[];
        auction: {
            client: {
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
            };
            winner: {
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
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.AuctionStatus;
            title: string;
            description: string | null;
            targetPrice: number | null;
            category: string;
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
        };
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            auctionId: string;
            adminNotes: string | null;
            clientAmount: number;
            commissionAmount: number;
            totalAmount: number;
            utrNumber: string | null;
            proofS3Key: string | null;
            proofS3Bucket: string | null;
        } | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PickupStatus;
        auctionId: string;
        scheduledDate: Date | null;
        paymentId: string | null;
        adminNotes: string | null;
    }>;
    schedule(id: string, date: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PickupStatus;
        auctionId: string;
        scheduledDate: Date | null;
        paymentId: string | null;
        adminNotes: string | null;
    }>;
    uploadDocument(id: string, file: Express.Multer.File, type: DocumentType): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.DocumentType;
        s3Key: string;
        s3Bucket: string;
        fileName: string;
        mimeType: string | null;
        uploadedAt: Date;
        pickupId: string;
    }>;
    complete(id: string, notes?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PickupStatus;
        auctionId: string;
        scheduledDate: Date | null;
        paymentId: string | null;
        adminNotes: string | null;
    }>;
}
