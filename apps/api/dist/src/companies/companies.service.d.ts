import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CompanyStatus, CompanyType, DocumentType } from '@prisma/client';
export declare class CompaniesService {
    private prisma;
    private s3;
    constructor(prisma: PrismaService, s3: S3Service);
    create(data: {
        name: string;
        type: CompanyType;
        gstNumber?: string;
        panNumber?: string;
        address?: string;
        city?: string;
        state?: string;
        pincode?: string;
    }, userId?: string): Promise<{
        id: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(type?: CompanyType, status?: CompanyStatus): Promise<({
        kycDocuments: {
            id: string;
            type: import("@prisma/client").$Enums.DocumentType;
            companyId: string;
            s3Key: string;
            s3Bucket: string;
            fileName: string;
            mimeType: string | null;
            uploadedAt: Date;
        }[];
        users: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
    } & {
        id: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        kycDocuments: {
            signedUrl: string;
            id: string;
            type: import("@prisma/client").$Enums.DocumentType;
            companyId: string;
            s3Key: string;
            s3Bucket: string;
            fileName: string;
            mimeType: string | null;
            uploadedAt: Date;
        }[];
        users: {
            id: string;
            name: string;
            email: string;
            role: import("@prisma/client").$Enums.UserRole;
        }[];
        id: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, status: CompanyStatus): Promise<{
        id: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: string, data: any): Promise<{
        id: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadKycDocument(companyId: string, file: Express.Multer.File, type: DocumentType): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.DocumentType;
        companyId: string;
        s3Key: string;
        s3Bucket: string;
        fileName: string;
        mimeType: string | null;
        uploadedAt: Date;
    }>;
    updateRating(vendorId: string, newRating: number): Promise<{
        id: string;
        name: string;
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
        createdAt: Date;
        updatedAt: Date;
    }>;
}
