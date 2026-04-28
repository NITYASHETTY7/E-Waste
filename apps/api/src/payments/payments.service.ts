import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { NotificationService } from '../notifications/notification.service';
import { PaymentStatus, DocumentType } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
    private notifications: NotificationService,
  ) {}

  // Create payment record after deal is closed (winner selected)
  async createForAuction(auctionId: string, clientAmount: number) {
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

  // Admin confirms payment → notify vendor to upload compliance docs
  async confirm(auctionId: string, adminNotes?: string) {
    const payment = await this.prisma.payment.update({
      where: { auctionId },
      data: { status: PaymentStatus.CONFIRMED, adminNotes },
    });

    // Notify winning vendor to upload compliance documents
    try {
      const auction = await this.prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
          winner: { include: { users: { select: { email: true, name: true }, take: 1 } } },
        },
      });
      const vendorUser = auction?.winner?.users?.[0];
      if (vendorUser?.email && auction?.winner) {
        await this.notifications.notifyCompliancePending(
          vendorUser.email,
          vendorUser.name || auction.winner.name,
          auction.title,
        );
      }
    } catch (e) {
      // Non-critical — don't fail payment confirmation if email fails
    }

    return payment;
  }
}
