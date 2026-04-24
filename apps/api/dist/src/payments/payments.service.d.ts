import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { PaymentStatus } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    private s3;
    constructor(prisma: PrismaService, s3: S3Service);
    createForAuction(auctionId: string, clientAmount: number): Promise<{
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
    }>;
    findByAuction(auctionId: string): Promise<{
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
    } | null>;
    findAll(status?: PaymentStatus): Promise<{
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
    }[]>;
    uploadProof(auctionId: string, file: Express.Multer.File, utrNumber?: string): Promise<{
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
    }>;
    confirm(auctionId: string, adminNotes?: string): Promise<{
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
    }>;
}
