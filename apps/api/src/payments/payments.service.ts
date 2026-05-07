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
  async uploadProof(
    id: string,
    file: Express.Multer.File,
    utrNumber?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    const { key } = await this.s3.upload(file, `payments/${payment.auctionId}`);
    return this.prisma.payment.update({
      where: { id },
      data: {
        proofS3Key: key,
        paymentProofUrl: key, // Added for new schema field
        utrNumber,
        status: PaymentStatus.SUBMITTED,
      },
    });
  }

  // Admin verifies payment → notify vendor and client
  async verifyPayment(id: string, adminNotes?: string) {
    const payment = await this.prisma.payment.update({
      where: { id },
      data: { status: PaymentStatus.CONFIRMED, adminNotes },
      include: {
        auction: {
          include: {
            winner: { include: { users: { take: 1 } } },
            client: { include: { users: { take: 1 } } }
          }
        }
      }
    });

    const auction = payment.auction;
    const vendorUser = auction.winner?.users?.[0];
    const clientUser = auction.client?.users?.[0];

    try {
      if (vendorUser?.email) {
        await this.notifications.notifyPaymentVerified(
          vendorUser.email,
          vendorUser.name || auction.winner!.name,
          auction.title,
          'VENDOR'
        );
        // Also trigger compliance pending email as requested originally
        await this.notifications.notifyCompliancePending(
          vendorUser.email,
          vendorUser.name || auction.winner!.name,
          auction.title,
        );
      }
      if (clientUser?.email) {
        await this.notifications.notifyPaymentVerified(
          clientUser.email,
          clientUser.name || auction.client!.name,
          auction.title,
          'CLIENT'
        );
      }
    } catch (e) {
      // Non-critical — don't fail payment confirmation if email fails
    }

    return payment;
  }
}
