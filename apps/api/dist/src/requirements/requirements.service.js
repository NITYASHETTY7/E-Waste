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
const notification_service_1 = require("../notifications/notification.service");
const client_1 = require("@prisma/client");
let RequirementsService = class RequirementsService {
    prisma;
    s3;
    notifications;
    constructor(prisma, s3, notifications) {
        this.prisma = prisma;
        this.s3 = s3;
        this.notifications = notifications;
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
                category: data.category,
                totalWeight: data.totalWeight ? Number(data.totalWeight) : undefined,
                invitedVendorIds: data.invitedVendorIds ?? [],
                sealedPhaseStart: data.sealedPhaseStart ? new Date(data.sealedPhaseStart) : undefined,
                sealedPhaseEnd: data.sealedPhaseEnd ? new Date(data.sealedPhaseEnd) : undefined,
            },
            include: { client: true },
        });
    }
    async findAll(clientId) {
        return this.prisma.requirement.findMany({
            where: clientId ? { clientId } : {},
            include: {
                client: { include: { users: { select: { id: true }, take: 1 } } },
                auditInvitations: true,
                auction: true,
            },
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
        const { targetPrice, totalWeight, category } = data;
        return this.prisma.requirement.update({
            where: { id },
            data: {
                targetPrice: Number(targetPrice),
                ...(totalWeight !== undefined && { totalWeight: Number(totalWeight) }),
                ...(category !== undefined && { category }),
                status: client_1.RequirementStatus.FINALIZED,
            },
        });
    }
    async adminApprove(id, adminUserId) {
        const req = await this.findOne(id);
        const updated = await this.prisma.requirement.update({
            where: { id },
            data: {
                status: client_1.RequirementStatus.FINALIZED,
                adminApprovedAt: new Date(),
                adminApprovedById: adminUserId,
            },
        });
        const now = new Date();
        const sealedStart = req.sealedPhaseStart ?? now;
        const sealedEnd = req.sealedPhaseEnd ?? new Date(now.getTime() + 3 * 60 * 60 * 1000);
        const auctionStatus = sealedStart <= now ? client_1.AuctionStatus.SEALED_PHASE : client_1.AuctionStatus.UPCOMING;
        let auction = req.auction;
        if (!auction) {
            auction = await this.prisma.auction.create({
                data: {
                    title: req.title,
                    category: req.category ?? 'General',
                    description: req.description,
                    basePrice: req.targetPrice ?? 0,
                    targetPrice: req.targetPrice,
                    clientId: req.clientId,
                    requirementId: req.id,
                    status: auctionStatus,
                    sealedPhaseStart: sealedStart,
                    sealedPhaseEnd: sealedEnd,
                },
            });
        }
        else {
            await this.prisma.auction.update({
                where: { id: auction.id },
                data: { status: auctionStatus, sealedPhaseStart: sealedStart, sealedPhaseEnd: sealedEnd },
            });
        }
        if (req.invitedVendorIds.length > 0) {
            const vendors = await this.prisma.user.findMany({
                where: { id: { in: req.invitedVendorIds } },
                select: { id: true, name: true, email: true },
            });
            const sealedEndStr = sealedEnd.toLocaleString('en-IN', {
                day: '2-digit', month: 'long', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true,
            });
            await Promise.all(vendors.map(v => this.notifications.notifySealedBidInvitation(v.email, v.name, req.title, auction.id, sealedEndStr)));
        }
        return { requirement: updated, auction };
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
        s3_service_1.S3Service,
        notification_service_1.NotificationService])
], RequirementsService);
//# sourceMappingURL=requirements.service.js.map