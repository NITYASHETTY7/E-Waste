import { CompaniesService } from './companies.service';
import { CompanyStatus, CompanyType, DocumentType } from '@prisma/client';
export declare class CompaniesController {
    private companiesService;
    constructor(companiesService: CompaniesService);
    create(req: any, body: any): Promise<{
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
    update(id: string, body: any): Promise<{
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
    uploadDocument(id: string, file: Express.Multer.File, type: DocumentType): Promise<{
        id: string;
        type: import("@prisma/client").$Enums.DocumentType;
        companyId: string;
        s3Key: string;
        s3Bucket: string;
        fileName: string;
        mimeType: string | null;
        uploadedAt: Date;
    }>;
    updateRating(id: string, rating: number): Promise<{
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
