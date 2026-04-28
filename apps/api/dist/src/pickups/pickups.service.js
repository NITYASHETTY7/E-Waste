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
exports.PickupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../s3/s3.service");
const client_1 = require("@prisma/client");
let PickupsService = class PickupsService {
    prisma;
    s3;
    constructor(prisma, s3) {
        this.prisma = prisma;
        this.s3 = s3;
    }
    async create(auctionId, paymentId) {
        return this.prisma.pickup.upsert({
            where: { auctionId },
            create: { auctionId, paymentId },
            update: { ...(paymentId && { paymentId }) },
        });
    }
    async findAll(status) {
        return this.prisma.pickup.findMany({
            where: status ? { status } : {},
            include: {
                auction: { include: { client: true, winner: true } },
                pickupDocs: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const pickup = await this.prisma.pickup.findUnique({
            where: { id },
            include: {
                auction: { include: { client: true, winner: true } },
                pickupDocs: true,
                payment: true,
            },
        });
        if (!pickup)
            throw new common_1.NotFoundException('Pickup not found');
        const docs = await Promise.all(pickup.pickupDocs.map(async (doc) => ({
            ...doc,
            signedUrl: await this.s3.getSignedUrl(doc.s3Key, doc.s3Bucket),
        })));
        return { ...pickup, pickupDocs: docs };
    }
    async schedule(id, scheduledDate) {
        return this.prisma.pickup.update({
            where: { id },
            data: { scheduledDate: new Date(scheduledDate), status: client_1.PickupStatus.SCHEDULED },
        });
    }
    async uploadDocument(id, file, type) {
        const pickup = await this.prisma.pickup.findUnique({ where: { id } });
        if (!pickup)
            throw new common_1.NotFoundException('Pickup not found');
        const { key, bucket } = await this.s3.upload(file, `pickups/${id}`);
        const doc = await this.prisma.pickupDocument.create({
            data: {
                type,
                s3Key: key,
                s3Bucket: bucket,
                fileName: file.originalname,
                mimeType: file.mimetype,
                pickupId: id,
            },
        });
        const allDocs = await this.prisma.pickupDocument.findMany({ where: { pickupId: id } });
        const hasRecycling = allDocs.some((d) => d.type === client_1.DocumentType.RECYCLING_CERTIFICATE);
        const hasDisposal = allDocs.some((d) => d.type === client_1.DocumentType.DISPOSAL_CERTIFICATE);
        if (hasRecycling && hasDisposal) {
            await this.prisma.pickup.update({
                where: { id },
                data: { status: client_1.PickupStatus.DOCUMENTS_UPLOADED },
            });
        }
        return doc;
    }
    async completePickup(id, adminNotes) {
        return this.prisma.pickup.update({
            where: { id },
            data: { status: client_1.PickupStatus.COMPLETED, adminNotes },
        });
    }
};
exports.PickupsService = PickupsService;
exports.PickupsService = PickupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service])
], PickupsService);
//# sourceMappingURL=pickups.service.js.map