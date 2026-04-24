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
exports.RequirementsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../s3/s3.service");
const client_1 = require("@prisma/client");
let RequirementsService = class RequirementsService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async create(data) {
        let rawS3Key;
        if (data.file) {
            const { key } = await this.s3.upload(data.file, `requirements/${data.clientId}`);
            rawS3Key = key;
        }
        return this.prisma.requirement.create({
            data: {
                title: data.title,
                description: data.description,
                clientId: data.clientId,
                rawS3Key,
            },
        });
    }
    async findAll(clientId) {
        return this.prisma.requirement.findMany({
            where: clientId ? { clientId } : {},
            include: { client: true, auditInvitations: true, auction: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const req = await this.prisma.requirement.findUnique({
            where: { id },
            include: {
                client: true,
                auditInvitations: { include: { vendor: true, report: true } },
                auction: true,
            },
        });
        if (!req)
            throw new common_1.NotFoundException('Requirement not found');
        return req;
    }
    async uploadProcessedSheet(id, file) {
        const req = await this.findOne(id);
        const { key } = await this.s3.upload(file, `requirements/${req.clientId}/processed`);
        return this.prisma.requirement.update({
            where: { id },
            data: { processedS3Key: key, status: client_1.RequirementStatus.CLIENT_REVIEW },
        });
    }
    async clientApprove(id, data) {
        return this.prisma.requirement.update({
            where: { id },
            data: {
                ...data,
                status: client_1.RequirementStatus.FINALIZED,
            },
        });
    }
    async getSignedUrl(id, field) {
        const req = await this.prisma.requirement.findUnique({ where: { id } });
        if (!req)
            throw new common_1.NotFoundException('Requirement not found');
        const key = field === 'raw' ? req.rawS3Key : req.processedS3Key;
        if (!key)
            throw new common_1.NotFoundException('File not found');
        return { url: await this.s3.getSignedUrl(key) };
    }
};
exports.RequirementsService = RequirementsService;
exports.RequirementsService = RequirementsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], RequirementsService);
//# sourceMappingURL=requirements.service.js.map