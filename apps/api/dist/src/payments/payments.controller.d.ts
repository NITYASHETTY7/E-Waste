import { PaymentsService } from './payments.service';
import { PaymentStatus } from '@prisma/client';
export declare class PaymentsController {
    private svc;
    constructor(svc: PaymentsService);
    create(auctionId: string, amount: number): Promise<{
        id: string;
        auctionId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        clientAmount: number;
        commissionAmount: number;
        totalAmount: number;
        utrNumber: string | null;
        proofS3Key: string | null;
        proofS3Bucket: string | null;
        adminNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(status?: PaymentStatus): Promise<{
        id: string;
        auctionId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        clientAmount: number;
        commissionAmount: number;
        totalAmount: number;
        utrNumber: string | null;
        proofS3Key: string | null;
        proofS3Bucket: string | null;
        adminNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    findOne(auctionId: string): Promise<{
        id: string;
        auctionId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        clientAmount: number;
        commissionAmount: number;
        totalAmount: number;
        utrNumber: string | null;
        proofS3Key: string | null;
        proofS3Bucket: string | null;
        adminNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    uploadProof(auctionId: string, file: Express.Multer.File, utrNumber?: string): Promise<{
        id: string;
        auctionId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        clientAmount: number;
        commissionAmount: number;
        totalAmount: number;
        utrNumber: string | null;
        proofS3Key: string | null;
        proofS3Bucket: string | null;
        adminNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    confirm(auctionId: string, notes?: string): Promise<{
        id: string;
        auctionId: string;
        status: import("@prisma/client").$Enums.PaymentStatus;
        clientAmount: number;
        commissionAmount: number;
        totalAmount: number;
        utrNumber: string | null;
        proofS3Key: string | null;
        proofS3Bucket: string | null;
        adminNotes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
