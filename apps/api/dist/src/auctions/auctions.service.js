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
exports.AuctionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../s3/s3.service");
const notification_service_1 = require("../notifications/notification.service");
const client_1 = require("@prisma/client");
let AuctionsService = class AuctionsService {
    prisma;
    s3;
    notifications;
    constructor(prisma, s3, notifications) {
        this.prisma = prisma;
        this.s3 = s3;
        this.notifications = notifications;
    }
    async findAllBids(auctionId) {
        return this.prisma.bid.findMany({
            where: auctionId ? { auctionId } : {},
            include: { vendor: { select: { id: true, name: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
        return this.prisma.auction.create({ data });
    }
    async findAll(status, clientId) {
        return this.prisma.auction.findMany({
            where: {
                ...(status && { status }),
                ...(clientId && { clientId }),
            },
            include: {
                client: true,
                winner: true,
                bids: { orderBy: { amount: 'desc' }, take: 1 },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const auction = await this.prisma.auction.findUnique({
            where: { id },
            include: {
                client: true,
                winner: true,
                bids: {
                    orderBy: { amount: 'desc' },
                    include: { vendor: { select: { id: true, name: true } } },
                },
                auctionDocs: true,
                pickup: true,
            },
        });
        if (!auction)
            throw new common_1.NotFoundException('Auction not found');
        return auction;
    }
    async schedule(id, data) {
        return this.prisma.auction.update({
            where: { id },
            data: {
                sealedPhaseStart: new Date(data.sealedPhaseStart),
                sealedPhaseEnd: new Date(data.sealedPhaseEnd),
                openPhaseStart: new Date(data.openPhaseStart),
                openPhaseEnd: new Date(data.openPhaseEnd),
                ...(data.tickSize && { tickSize: data.tickSize }),
                ...(data.maxTicks && { maxTicks: data.maxTicks }),
                ...(data.extensionMinutes && { extensionMinutes: data.extensionMinutes }),
                status: client_1.AuctionStatus.UPCOMING,
            },
        });
    }
    async submitSealedBid(auctionId, vendorId, amount, file, remarks) {
        const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
        if (!auction)
            throw new common_1.NotFoundException('Auction not found');
        if (auction.status !== client_1.AuctionStatus.SEALED_PHASE) {
            throw new common_1.BadRequestException('Sealed bidding is not currently open');
        }
        let priceSheetS3Key;
        let priceSheetS3Bucket;
        let priceSheetFileName;
        if (file) {
            const { key, bucket } = await this.s3.upload(file, `bids/${auctionId}/${vendorId}`);
            priceSheetS3Key = key;
            priceSheetS3Bucket = bucket;
            priceSheetFileName = file.originalname;
        }
        return this.prisma.bid.create({
            data: {
                auctionId,
                vendorId,
                amount,
                phase: client_1.BidPhase.SEALED,
                remarks,
                priceSheetS3Key,
                priceSheetS3Bucket,
                priceSheetFileName,
            },
        });
    }
    async selectWinner(id, vendorId) {
        const auction = await this.prisma.auction.update({
            where: { id },
            data: { winnerId: vendorId, status: client_1.AuctionStatus.COMPLETED },
            include: {
                client: true,
                bids: {
                    where: { vendorId },
                    orderBy: { amount: 'desc' },
                    take: 1,
                    include: { vendor: { select: { id: true, name: true, email: true } } },
                },
            },
        });
        const winningBid = auction.bids[0];
        if (winningBid?.vendor?.email) {
            await this.notifications.notifyAuctionWinner(winningBid.vendor.email, winningBid.vendor.name, auction.title, winningBid.amount, auction.client.name, auction.id).catch(() => { });
        }
        return auction;
    }
    async uploadFinalQuote(auctionId, file, type) {
        const { key, bucket } = await this.s3.upload(file, `final-quotes/${auctionId}`);
        return this.prisma.auctionDocument.create({
            data: {
                type: type,
                s3Key: key,
                s3Bucket: bucket,
                fileName: file.originalname,
                mimeType: file.mimetype,
                auctionId,
            },
        });
    }
    async approveQuote(auctionId) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: auctionId },
            include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
        });
        if (!auction)
            throw new common_1.NotFoundException('Auction not found');
        const winningBid = auction.bids[0];
        const totalAmount = winningBid?.amount || auction.basePrice;
        const commissionAmount = Math.round(totalAmount * 0.05);
        const clientAmount = totalAmount - commissionAmount;
        await this.prisma.auction.update({
            where: { id: auctionId },
            data: { quoteApproved: true },
        });
        const payment = await this.prisma.payment.upsert({
            where: { auctionId },
            create: { auctionId, clientAmount, commissionAmount, totalAmount },
            update: { clientAmount, commissionAmount, totalAmount },
        });
        return { auction: { ...auction, quoteApproved: true }, payment };
    }
    async rejectQuote(auctionId, remarks) {
        return this.prisma.auction.update({
            where: { id: auctionId },
            data: { quoteApproved: false, quoteRemarks: remarks },
        });
    }
    async updateStatus(id, status) {
        return this.prisma.auction.update({ where: { id }, data: { status } });
    }
    async transitionPhases() {
        const now = new Date();
        await this.prisma.auction.updateMany({
            where: { status: client_1.AuctionStatus.UPCOMING, sealedPhaseStart: { lte: now } },
            data: { status: client_1.AuctionStatus.SEALED_PHASE },
        });
        await this.prisma.auction.updateMany({
            where: { status: client_1.AuctionStatus.SEALED_PHASE, openPhaseStart: { lte: now } },
            data: { status: client_1.AuctionStatus.OPEN_PHASE },
        });
        await this.prisma.auction.updateMany({
            where: { status: client_1.AuctionStatus.OPEN_PHASE, openPhaseEnd: { lte: now } },
            data: { status: client_1.AuctionStatus.PENDING_SELECTION },
        });
    }
    async extendTimer(id) {
        const auction = await this.prisma.auction.findUnique({ where: { id } });
        if (!auction || !auction.openPhaseEnd)
            throw new common_1.NotFoundException('Auction not found');
        if (auction.extensionCount >= auction.maxTicks)
            return auction;
        const newEnd = new Date(auction.openPhaseEnd.getTime() + auction.extensionMinutes * 60 * 1000);
        return this.prisma.auction.update({
            where: { id },
            data: { openPhaseEnd: newEnd, extensionCount: { increment: 1 } },
        });
    }
};
exports.AuctionsService = AuctionsService;
exports.AuctionsService = AuctionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service,
        notification_service_1.NotificationService])
], AuctionsService);
//# sourceMappingURL=auctions.service.js.map