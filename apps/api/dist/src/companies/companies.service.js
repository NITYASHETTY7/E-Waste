"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompaniesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../s3/s3.service");
let CompaniesService = class CompaniesService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async create(data, userId) {
        const company = await this.prisma.company.create({ data });
        if (userId) {
            await this.prisma.user.update({
                where: { id: userId },
                data: { companyId: company.id }
            });
        }
        return company;
    }
    async findAll(type, status) {
        const companies = await this.prisma.company.findMany({
            where: {
                ...(type && { type }),
                ...(status && { status }),
            },
            include: {
                users: { select: { id: true, name: true, email: true, role: true } },
                kycDocuments: true,
            },
        });
        return Promise.all(companies.map(async (company) => {
            const docs = await Promise.all(company.kycDocuments.map(async (doc) => ({
                ...doc,
                signedUrl: await this.s3.getSignedUrl(doc.s3Key, doc.s3Bucket),
            })));
            return { ...company, kycDocuments: docs };
        }));
    }
    async findOne(id) {
        const company = await this.prisma.company.findUnique({
            where: { id },
            include: {
                users: { select: { id: true, name: true, email: true, role: true } },
                kycDocuments: true,
            },
        });
        if (!company)
            throw new common_1.NotFoundException('Company not found');
        const docs = await Promise.all(company.kycDocuments.map(async (doc) => ({
            ...doc,
            signedUrl: await this.s3.getSignedUrl(doc.s3Key, doc.s3Bucket),
        })));
        return { ...company, kycDocuments: docs };
    }
    async updateStatus(id, status) {
        return this.prisma.company.update({ where: { id }, data: { status } });
    }
    async update(id, data) {
        const { id: _id, users, kycDocuments, auctions, wonAuctions, auditInvitations, requirements, createdAt, updatedAt, ...safeData } = data;
        return this.prisma.company.update({ where: { id }, data: safeData });
    }
    async uploadKycDocument(companyId, file, type) {
        const { key, bucket } = await this.s3.upload(file, `kyc/${companyId}`);
        return this.prisma.kycDocument.create({
            data: {
                type,
                s3Key: key,
                s3Bucket: bucket,
                fileName: file.originalname,
                mimeType: file.mimetype,
                companyId,
            },
        });
    }
    async getSignedUrl(s3Key, s3Bucket) {
        const url = await this.s3.getSignedUrl(s3Key, s3Bucket);
        return { url };
    }
    async updateRating(vendorId, newRating) {
        const company = await this.prisma.company.findUnique({ where: { id: vendorId } });
        if (!company)
            throw new common_1.NotFoundException('Vendor not found');
        const totalRatings = company.ratingCount + 1;
        const avgRating = ((company.rating || 0) * company.ratingCount + newRating) / totalRatings;
        return this.prisma.company.update({
            where: { id: vendorId },
            data: { rating: avgRating, ratingCount: totalRatings },
        });
    }
};
exports.CompaniesService = CompaniesService;
exports.CompaniesService = CompaniesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], CompaniesService);
//# sourceMappingURL=companies.service.js.map