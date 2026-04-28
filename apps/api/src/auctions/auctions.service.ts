import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { AuctionStatus, BidPhase, DocumentType } from '@prisma/client';

@Injectable()
export class AuctionsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  async findAllBids(auctionId?: string) {
    return this.prisma.bid.findMany({
      where: auctionId ? { auctionId } : {},
      include: { vendor: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    title: string;
    category: string;
    description?: string;
    basePrice: number;
    targetPrice?: number;
    tickSize?: number;
    maxTicks?: number;
    extensionMinutes?: number;
    clientId: string;
    requirementId?: string;
  }) {
    return this.prisma.auction.create({ data });
  }

  async findAll(status?: AuctionStatus, clientId?: string) {
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

  async findOne(id: string) {
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
    if (!auction) throw new NotFoundException('Auction not found');
    return auction;
  }

  async schedule(
    id: string,
    data: {
      sealedPhaseStart: string;
      sealedPhaseEnd: string;
      openPhaseStart: string;
      openPhaseEnd: string;
      tickSize?: number;
      maxTicks?: number;
      extensionMinutes?: number;
    },
  ) {
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
        status: AuctionStatus.UPCOMING,
      },
    });
  }

  async submitSealedBid(
    auctionId: string,
    vendorId: string,
    amount: number,
    file?: Express.Multer.File,
    remarks?: string,
  ) {
    const auction = await this.prisma.auction.findUnique({ where: { id: auctionId } });
    if (!auction) throw new NotFoundException('Auction not found');
    if (auction.status !== AuctionStatus.SEALED_PHASE) {
      throw new BadRequestException('Sealed bidding is not currently open');
    }

    let priceSheetS3Key: string | undefined;
    let priceSheetS3Bucket: string | undefined;
    let priceSheetFileName: string | undefined;

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
        phase: BidPhase.SEALED,
        remarks,
        priceSheetS3Key,
        priceSheetS3Bucket,
        priceSheetFileName,
      },
    });
  }

  async selectWinner(id: string, vendorId: string) {
    return this.prisma.auction.update({
      where: { id },
      data: { winnerId: vendorId, status: AuctionStatus.COMPLETED },
    });
  }

  async uploadFinalQuote(
    auctionId: string,
    file: Express.Multer.File,
    type: 'FINAL_QUOTE' | 'LETTERHEAD_QUOTATION',
  ) {
    const { key, bucket } = await this.s3.upload(file, `final-quotes/${auctionId}`);
    return this.prisma.auctionDocument.create({
      data: {
        type: type as DocumentType,
        s3Key: key,
        s3Bucket: bucket,
        fileName: file.originalname,
        mimeType: file.mimetype,
        auctionId,
      },
    });
  }

  async approveQuote(auctionId: string) {
    const auction = await this.prisma.auction.findUnique({
      where: { id: auctionId },
      include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
    });
    if (!auction) throw new NotFoundException('Auction not found');

    // Calculate commission (5%) and client amount
    const winningBid = auction.bids[0];
    const totalAmount = winningBid?.amount || auction.basePrice;
    const commissionAmount = Math.round(totalAmount * 0.05);
    const clientAmount = totalAmount - commissionAmount;

    // Update auction
    await this.prisma.auction.update({
      where: { id: auctionId },
      data: { quoteApproved: true },
    });

    // Upsert payment record — safe to call multiple times
    const payment = await this.prisma.payment.upsert({
      where: { auctionId },
      create: { auctionId, clientAmount, commissionAmount, totalAmount },
      update: { clientAmount, commissionAmount, totalAmount },
    });

    return { auction: { ...auction, quoteApproved: true }, payment };
  }

  async rejectQuote(auctionId: string, remarks: string) {
    return this.prisma.auction.update({
      where: { id: auctionId },
      data: { quoteApproved: false, quoteRemarks: remarks },
    });
  }

  async updateStatus(id: string, status: AuctionStatus) {
    return this.prisma.auction.update({ where: { id }, data: { status } });
  }

  async transitionPhases() {
    const now = new Date();

    await this.prisma.auction.updateMany({
      where: { status: AuctionStatus.UPCOMING, sealedPhaseStart: { lte: now } },
      data: { status: AuctionStatus.SEALED_PHASE },
    });

    await this.prisma.auction.updateMany({
      where: { status: AuctionStatus.SEALED_PHASE, openPhaseStart: { lte: now } },
      data: { status: AuctionStatus.OPEN_PHASE },
    });

    await this.prisma.auction.updateMany({
      where: { status: AuctionStatus.OPEN_PHASE, openPhaseEnd: { lte: now } },
      data: { status: AuctionStatus.PENDING_SELECTION },
    });
  }

  async extendTimer(id: string) {
    const auction = await this.prisma.auction.findUnique({ where: { id } });
    if (!auction || !auction.openPhaseEnd) throw new NotFoundException('Auction not found');
    if (auction.extensionCount >= auction.maxTicks) return auction;

    const newEnd = new Date(
      auction.openPhaseEnd.getTime() + auction.extensionMinutes * 60 * 1000,
    );
    return this.prisma.auction.update({
      where: { id },
      data: { openPhaseEnd: newEnd, extensionCount: { increment: 1 } },
    });
  }
}
