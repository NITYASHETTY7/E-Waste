import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private prisma: PrismaService) {}

  async submitRating(data: {
    auctionId: string;
    fromCompanyId: string;
    toCompanyId: string;
    score: number;
    comment?: string;
    type: 'CLIENT_TO_VENDOR' | 'VENDOR_TO_CLIENT';
  }) {
    if (data.score < 1 || data.score > 5) {
      throw new BadRequestException('Score must be between 1 and 5');
    }
    return this.prisma.rating.upsert({
      where: {
        auctionId_fromCompanyId_type: {
          auctionId: data.auctionId,
          fromCompanyId: data.fromCompanyId,
          type: data.type,
        },
      },
      create: data,
      update: { score: data.score, comment: data.comment },
    });
  }

  async getRatingsForAuction(auctionId: string) {
    return this.prisma.rating.findMany({
      where: { auctionId },
      include: {
        fromCompany: { select: { id: true, name: true } },
        toCompany: { select: { id: true, name: true } },
      },
    });
  }

  async getRatingsForCompany(companyId: string) {
    const received = await this.prisma.rating.findMany({
      where: { toCompanyId: companyId },
      include: { fromCompany: { select: { id: true, name: true } }, auction: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const avg = received.length > 0 ? received.reduce((s, r) => s + r.score, 0) / received.length : 0;
    return { ratings: received, averageScore: Math.round(avg * 10) / 10, count: received.length };
  }
}
