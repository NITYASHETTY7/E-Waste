import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { PaymentStatus, DocumentType } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  // Create payment record after deal is closed (winner selected)
  async createForAuction(auctionId: string, clientAmount: number) {
    const commission = parseFloat((clientAmount * 0.05).toFixed(2));
    return this.prisma.payment.create({
      data: {
        auctionId,
        clientAmount,
        commissionAmount: commission,
        totalAmount: clientAmount + commission,
      },
    });
  }

  async findByAuction(auctionId: string) {
    return this.prisma.payment.findUnique({ where: { auctionId } });
  }

  async findAll(status?: PaymentStatus) {
    return this.prisma.payment.findMany({
      where: status ? { status } : {},
      orderBy: { createdAt: 'desc' },
    });
  }

  // Vendor uploads payment proof (screenshot / UTR)
  async uploadProof(auctionId: string, file: Express.Multer.File, utrNumber?: string) {
    const { key } = await this.s3.upload(file, `payments/${auctionId}`);
    return this.prisma.payment.update({
      where: { auctionId },
      data: {
        proofS3Key: key,
        utrNumber,
        status: PaymentStatus.SUBMITTED,
      },
    });
  }

  // Admin confirms payment
  async confirm(auctionId: string, adminNotes?: string) {
    return this.prisma.payment.update({
      where: { auctionId },
      data: { status: PaymentStatus.CONFIRMED, adminNotes },
    });
  }
}
