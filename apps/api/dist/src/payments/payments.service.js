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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const s3_service_1 = require("../s3/s3.service");
const notification_service_1 = require("../notifications/notification.service");
const client_1 = require("@prisma/client");
let PaymentsService = class PaymentsService {
    prisma;
    s3;
    notifications;
    constructor(prisma, s3, notifications) {
        this.prisma = prisma;
        this.s3 = s3;
        this.notifications = notifications;
    }
    async createForAuction(auctionId, clientAmount) {
        const commission = parseFloat((clientAmount * 0.05).toFixed(2));
        return this.prisma.payment.upsert({
            where: { auctionId },
            create: {
                auctionId,
                clientAmount,
                commissionAmount: commission,
                totalAmount: clientAmount + commission,
            },
            update: {
                clientAmount,
                commissionAmount: commission,
                totalAmount: clientAmount + commission,
            },
        });
    }
    async findByAuction(auctionId) {
        return this.prisma.payment.findUnique({ where: { auctionId } });
    }
    async findAll(status) {
        return this.prisma.payment.findMany({
            where: status ? { status } : {},
            orderBy: { createdAt: 'desc' },
        });
    }
    async uploadProof(auctionId, file, utrNumber) {
        const { key } = await this.s3.upload(file, `payments/${auctionId}`);
        return this.prisma.payment.update({
            where: { auctionId },
            data: {
                proofS3Key: key,
                utrNumber,
                status: client_1.PaymentStatus.SUBMITTED,
            },
        });
    }
    async confirm(auctionId, adminNotes) {
        const payment = await this.prisma.payment.update({
            where: { auctionId },
            data: { status: client_1.PaymentStatus.CONFIRMED, adminNotes },
        });
        try {
            const auction = await this.prisma.auction.findUnique({
                where: { id: auctionId },
                include: {
                    winner: { include: { users: { select: { email: true, name: true }, take: 1 } } },
                },
            });
            const vendorUser = auction?.winner?.users?.[0];
            if (vendorUser?.email && auction?.winner) {
                await this.notifications.notifyCompliancePending(vendorUser.email, vendorUser.name || auction.winner.name, auction.title);
            }
        }
        catch (e) {
        }
        return payment;
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        s3_service_1.S3Service,
        notification_service_1.NotificationService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map