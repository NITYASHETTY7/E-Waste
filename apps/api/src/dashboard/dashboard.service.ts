import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionStatus, CompanyStatus, PaymentStatus, PickupStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getAdminStats() {
    const [
      totalClients,
      totalVendors,
      pendingApprovals,
      activeAuctions,
      totalRevenue,
      pendingPayments,
      completedDeals,
    ] = await Promise.all([
      this.prisma.company.count({ where: { type: 'CLIENT', status: CompanyStatus.APPROVED } }),
      this.prisma.company.count({ where: { type: 'VENDOR', status: CompanyStatus.APPROVED } }),
      this.prisma.company.count({ where: { status: CompanyStatus.PENDING } }),
      this.prisma.auction.count({ where: { status: AuctionStatus.OPEN_PHASE } }),
      this.prisma.payment.aggregate({
        _sum: { commissionAmount: true },
        where: { status: PaymentStatus.CONFIRMED },
      }),
      this.prisma.payment.count({ where: { status: PaymentStatus.SUBMITTED } }),
      this.prisma.auction.count({ where: { status: AuctionStatus.COMPLETED } }),
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

  async getClientStats(clientId: string) {
    const [myAuctions, activeAuctions, completedAuctions] = await Promise.all([
      this.prisma.auction.count({ where: { clientId } }),
      this.prisma.auction.count({
        where: { clientId, status: { in: [AuctionStatus.OPEN_PHASE, AuctionStatus.SEALED_PHASE] } },
      }),
      this.prisma.auction.count({ where: { clientId, status: AuctionStatus.COMPLETED } }),
    ]);

    const recentAuctions = await this.prisma.auction.findMany({
      where: { clientId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { winner: true },
    });

    return { myAuctions, activeAuctions, completedAuctions, recentAuctions };
  }

  async getVendorStats(vendorId: string) {
    const [wonAuctions, activeBids, pendingPickups] = await Promise.all([
      this.prisma.auction.count({ where: { winnerId: vendorId } }),
      this.prisma.bid.count({
        where: {
          vendor: { companyId: vendorId },
          auction: { status: AuctionStatus.OPEN_PHASE },
        },
      }),
      this.prisma.pickup.count({
        where: {
          auction: { winnerId: vendorId },
          status: { in: [PickupStatus.SCHEDULED, PickupStatus.DOCUMENTS_UPLOADED] },
        },
      }),
    ]);

    const recentWins = await this.prisma.auction.findMany({
      where: { winnerId: vendorId, status: AuctionStatus.COMPLETED },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: { client: true },
    });

    return { wonAuctions, activeBids, pendingPickups, recentWins };
  }
}
