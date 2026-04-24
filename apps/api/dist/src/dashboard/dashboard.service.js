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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAdminStats() {
        const [totalClients, totalVendors, pendingApprovals, activeAuctions, totalRevenue, pendingPayments, completedDeals,] = await Promise.all([
            this.prisma.company.count({ where: { type: 'CLIENT', status: client_1.CompanyStatus.APPROVED } }),
            this.prisma.company.count({ where: { type: 'VENDOR', status: client_1.CompanyStatus.APPROVED } }),
            this.prisma.company.count({ where: { status: client_1.CompanyStatus.PENDING } }),
            this.prisma.auction.count({ where: { status: client_1.AuctionStatus.OPEN_PHASE } }),
            this.prisma.payment.aggregate({
                _sum: { commissionAmount: true },
                where: { status: client_1.PaymentStatus.CONFIRMED },
            }),
            this.prisma.payment.count({ where: { status: client_1.PaymentStatus.SUBMITTED } }),
            this.prisma.auction.count({ where: { status: client_1.AuctionStatus.COMPLETED } }),
        ]);
        return {
            totalClients,
            totalVendors,
            pendingApprovals,
            activeAuctions,
            totalRevenue: totalRevenue._sum.commissionAmount || 0,
            pendingPayments,
            completedDeals,
        };
    }
    async getClientStats(clientId) {
        const [myAuctions, activeAuctions, completedAuctions] = await Promise.all([
            this.prisma.auction.count({ where: { clientId } }),
            this.prisma.auction.count({
                where: { clientId, status: { in: [client_1.AuctionStatus.OPEN_PHASE, client_1.AuctionStatus.SEALED_PHASE] } },
            }),
            this.prisma.auction.count({ where: { clientId, status: client_1.AuctionStatus.COMPLETED } }),
        ]);
        const recentAuctions = await this.prisma.auction.findMany({
            where: { clientId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { winner: true },
        });
        return { myAuctions, activeAuctions, completedAuctions, recentAuctions };
    }
    async getVendorStats(vendorId) {
        const [wonAuctions, activeBids, pendingPickups] = await Promise.all([
            this.prisma.auction.count({ where: { winnerId: vendorId } }),
            this.prisma.bid.count({
                where: {
                    vendor: { companyId: vendorId },
                    auction: { status: client_1.AuctionStatus.OPEN_PHASE },
                },
            }),
            this.prisma.pickup.count({
                where: {
                    auction: { winnerId: vendorId },
                    status: { in: [client_1.PickupStatus.SCHEDULED, client_1.PickupStatus.DOCUMENTS_UPLOADED] },
                },
            }),
        ]);
        const recentWins = await this.prisma.auction.findMany({
            where: { winnerId: vendorId, status: client_1.AuctionStatus.COMPLETED },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: { client: true },
        });
        return { wonAuctions, activeBids, pendingPickups, recentWins };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map