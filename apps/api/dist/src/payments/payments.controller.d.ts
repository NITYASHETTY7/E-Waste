import { PaymentsService } from './payments.service';
import { PaymentStatus } from '@prisma/client';
export declare class PaymentsController {
    private svc;
    constructor(svc: PaymentsService);
    create(auctionId: string, amount: number): Promise<{
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
    findOne(auctionId: string): Promise<{
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
    confirm(auctionId: string, notes?: string): Promise<{
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
