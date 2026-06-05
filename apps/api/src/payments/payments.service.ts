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

  async uploadProofByAuction(
    auctionId: string,
    file: Express.Multer.File,
    utrNumber?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({
      where: { auctionId },
    });
    if (!payment)
      throw new NotFoundException('Payment not found for this auction');
    return this.uploadProof(payment.id, file, utrNumber);
  }

  async verifyPaymentByAuction(auctionId: string, adminNotes?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { auctionId },
    });
    if (!payment)
      throw new NotFoundException('Payment not found for this auction');
    return this.verifyPayment(payment.id, adminNotes);
  }

  async findAll(status?: PaymentStatus) {
    return this.prisma.payment.findMany({
      where: status ? { status } : {},
      include: {
        auction: {
          include: {
            client: { select: { id: true, name: true } },
            winner: { select: { id: true, name: true } },
          },
        },
        penaltyCompany: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Fetch all payments where the company is the client, the winning vendor, or the penalized company
  async findByCompany(companyId: string) {
    return this.prisma.payment.findMany({
      where: {
        OR: [
          {
            auction: {
              OR: [
                { clientId: companyId },
                { winnerId: companyId },
              ],
            },
          },
          { penaltyCompanyId: companyId }
        ]
      },
      include: {
        auction: {
          include: {
            client: { select: { id: true, name: true } },
            winner: { select: { id: true, name: true } },
          },
        },
        penaltyCompany: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Fetch payments linked to auctions from listings owned by this user (individual user)
  // Individual users use the quote/pickup flow, so we return their product transactions
  async findByUser(userId: string) {
    // Individual users have UserProductPickup records (not auction payments)
    return this.prisma.userProductPickup.findMany({
      where: {
        product: { userId },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            weightKg: true,
            askingPrice: true,
            acceptedQuoteId: true,
            quotes: {
              where: { status: 'accepted' },
              include: { vendorCompany: { select: { id: true, name: true } } },
              take: 1,
            },
          },
        },
        vendorCompany: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Vendor uploads payment proof (screenshot / UTR)
  async uploadProof(id: string, file: Express.Multer.File, utrNumber?: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { auction: { include: { winner: true } } },
    });
    if (!payment) throw new NotFoundException('Payment not found');

    const { key } = await this.s3.upload(file, `payments/${payment.auctionId}`);
    const updatedPayment = await this.prisma.payment.update({
      where: { id },
      data: {
        proofS3Key: key,
        paymentProofUrl: key, // Added for new schema field
        utrNumber,
        status: PaymentStatus.SUBMITTED,
      },
    });

    // Notify admins in-app
    await this.notifications
      .notifyAdmins({
        type: 'payment_proof_uploaded',
        title: 'Payment Proof Uploaded',
        message: `Vendor "${payment.auction?.winner?.name || 'Winner'}" uploaded payment proof for "${payment.auction?.title || 'Auction'}".`,
        link: '/admin/payments',
      })
      .catch((err) => console.error('Background task error:', err));

    return updatedPayment;
  }

  // Vendor uploads penalty payment proof
  async createPenaltyPayment(
    companyId: string,
    amount: number,
    file: Express.Multer.File,
    utrNumber?: string,
  ) {
    const { key } = await this.s3.upload(file, `penalties/${companyId}`);
    
    // Create the payment record for tracking
    const payment = await this.prisma.payment.create({
      data: {
        clientAmount: 0,
        commissionAmount: 0,
        totalAmount: amount,
        status: PaymentStatus.SUBMITTED,
        proofS3Key: key,
        proofS3Bucket: 'ecoloop-uploads',
        paymentProofUrl: key,
        utrNumber,
        isPenalty: true,
        penaltyCompanyId: companyId,
      },
    });

    // Notify admins
    const company = await this.prisma.company.findUnique({ where: { id: companyId } });
    await this.notifications
      .notifyAdmins({
        type: 'penalty_payment_uploaded',
        title: 'Penalty Payment Uploaded',
        message: `Vendor "${company?.name || 'Unknown'}" uploaded penalty payment proof for ₹${amount}.`,
        link: '/admin/payments',
      })
      .catch((err) => console.error('Background task error:', err));

    return payment;
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
            client: { include: { users: { take: 1 } } },
          },
        },
        penaltyCompany: { include: { users: { take: 1 } } },
      },
    });

    if (payment.isPenalty && payment.penaltyCompanyId) {
      // Clear penalty amount on company once transaction is confirmed
      await this.prisma.company.update({
        where: { id: payment.penaltyCompanyId },
        data: { penaltyAmount: 0 },
      });
      
      const vendorUser = payment.penaltyCompany?.users?.[0];
      if (vendorUser?.id) {
        await this.notifications
          .createInAppNotification({
            userId: vendorUser.id,
            type: 'penalty_cleared',
            title: 'Penalty Cleared',
            message: `Your penalty payment of ₹${payment.totalAmount} has been verified and your account is clear.`,
            link: '/vendor/profile',
          })
          .catch((err) => console.error('Background task error:', err));
      }
      return payment;
    }

    const auction = payment.auction;
    if (!auction) return payment;

    // Auto-clear penalty on company once transaction is confirmed
    if (auction.winnerId && auction.winner?.penaltyAmount) {
      await this.prisma.company.update({
        where: { id: auction.winnerId },
        data: { penaltyAmount: 0 },
      });
    }
    const vendorUser = auction.winner?.users?.[0];
    const clientUser = auction.client?.users?.[0];

    try {
      if (vendorUser?.email) {
        await this.notifications.notifyPaymentVerified(
          vendorUser.email,
          vendorUser.name || auction.winner!.name,
          auction.title,
          'VENDOR',
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
          clientUser.name || auction.client.name,
          auction.title,
          'CLIENT',
        );
        // Ask client to upload gate pass now that payment is processing
        await this.notifications.notifyClientUploadGatePass(
          clientUser.email,
          clientUser.name || auction.client.name,
          auction.title,
          auction.winner?.name ?? 'the vendor',
        );
      }
    } catch (e) {
      // Non-critical — don't fail payment confirmation if email fails
    }

    // In-app notifications
    if (vendorUser?.id) {
      await this.notifications
        .createInAppNotification({
          userId: vendorUser.id,
          type: 'payment_verified',
          title: 'Payment Confirmed & Verified',
          message: `Your payment for "${auction.title}" has been verified. Please upload required compliance certificates.`,
          link: '/vendor/pickups',
        })
        .catch((err) => console.error('Background task error:', err));
    }

    if (clientUser?.id) {
      await this.notifications
        .createInAppNotification({
          userId: clientUser.id,
          type: 'payment_verified',
          title: 'Vendor Payment Verified',
          message: `Vendor payment for "${auction.title}" has been verified. Please upload the Gate Pass now.`,
          link: '/client/handover',
        })
        .catch((err) => console.error('Background task error:', err));
    }

    return payment;
  }
}
