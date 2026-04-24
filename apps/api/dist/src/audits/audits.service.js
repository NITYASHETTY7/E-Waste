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
exports.AuditsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../s3/s3.service");
const client_1 = require("@prisma/client");
let AuditsService = class AuditsService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async inviteVendors(requirementId, vendorIds) {
        const invitations = await Promise.all(vendorIds.map((vendorId) => this.prisma.auditInvitation.upsert({
            where: { requirementId_vendorId: { requirementId, vendorId } },
            create: { requirementId, vendorId },
            update: { status: client_1.AuditStatus.INVITED },
        })));
        return invitations;
    }
    async findAllInvitations(vendorId, requirementId) {
        return this.prisma.auditInvitation.findMany({
            where: {
                ...(vendorId && { vendorId }),
                ...(requirementId && { requirementId }),
            },
            include: {
                requirement: { include: { client: true } },
                vendor: true,
                report: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOneInvitation(id) {
        const inv = await this.prisma.auditInvitation.findUnique({
            where: { id },
            include: {
                requirement: { include: { client: true } },
                vendor: true,
                report: { include: { photos: true } },
            },
        });
        if (!inv)
            throw new common_1.NotFoundException('Audit invitation not found');
        return inv;
    }
    async respondToInvitation(id, status) {
        return this.prisma.auditInvitation.update({
            where: { id },
            data: { status: status },
        });
    }
    async shareSpoc(id, data) {
        return this.prisma.auditInvitation.update({
            where: { id },
            data: {
                siteAddress: data.siteAddress,
                spocName: data.spocName,
                spocPhone: data.spocPhone,
                scheduledAt: new Date(data.scheduledAt),
                status: client_1.AuditStatus.SCHEDULED,
            },
        });
    }
    async submitReport(invitationId, data) {
        const report = await this.prisma.auditReport.upsert({
            where: { invitationId },
            create: {
                invitationId,
                productMatch: data.productMatch,
                remarks: data.remarks,
                completedAt: new Date(),
                vendorUserId: data.vendorUserId,
            },
            update: {
                productMatch: data.productMatch,
                remarks: data.remarks,
                completedAt: new Date(),
            },
        });
        if (data.photos && data.photos.length > 0) {
            await Promise.all(data.photos.map((photo) => this.s3
                .upload(photo, `audits/${invitationId}`, false)
                .then(({ key, bucket }) => this.prisma.auditPhoto.create({
                data: {
                    s3Key: key,
                    s3Bucket: bucket,
                    fileName: photo.originalname,
                    mimeType: photo.mimetype,
                    auditReportId: report.id,
                },
            }))));
        }
        await this.prisma.auditInvitation.update({
            where: { id: invitationId },
            data: { status: client_1.AuditStatus.COMPLETED },
        });
        return report;
    }
};
exports.AuditsService = AuditsService;
exports.AuditsService = AuditsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], AuditsService);
//# sourceMappingURL=audits.service.js.map