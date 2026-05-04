import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { NotificationService } from '../notifications/notification.service';
import { RequirementStatus, AuctionStatus } from '@prisma/client';

@Injectable()
export class RequirementsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
    private notifications: NotificationService,
  ) {}

  async create(data: {
    title: string;
    description?: string;
    clientId: string;
    category?: string;
    totalWeight?: number;
    location?: string;
    invitedVendorIds?: string[];
    sealedPhaseStart?: string;
    sealedPhaseEnd?: string;
    file?: Express.Multer.File;
  }) {
    let rawS3Key: string | undefined;
    if (data.file) {
      const { key } = await this.s3.upload(data.file, `requirements/${data.clientId}`);
      rawS3Key = key;
    }

    return this.prisma.requirement.create({
      data: {
        title: data.title,
        description: data.description,
        clientId: data.clientId,
        rawS3Key,
        category: data.category,
        totalWeight: data.totalWeight ? Number(data.totalWeight) : undefined,
        invitedVendorIds: data.invitedVendorIds ?? [],
        sealedPhaseStart: data.sealedPhaseStart ? new Date(data.sealedPhaseStart) : undefined,
        sealedPhaseEnd: data.sealedPhaseEnd ? new Date(data.sealedPhaseEnd) : undefined,
      },
      include: { client: true },
    });
  }

  async findAll(clientId?: string) {
    return this.prisma.requirement.findMany({
      where: clientId ? { clientId } : {},
      include: {
        client: { include: { users: { select: { id: true }, take: 1 } } },
        auditInvitations: true,
        auction: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const req = await this.prisma.requirement.findUnique({
      where: { id },
      include: {
        client: true,
        auditInvitations: { include: { vendor: true, report: true } },
        auction: true,
      },
    });
    if (!req) throw new NotFoundException('Requirement not found');
    return req;
  }

  // Admin uploads the cleaned / processed sheet
  async uploadProcessedSheet(id: string, file: Express.Multer.File) {
    const req = await this.findOne(id);
    const { key } = await this.s3.upload(file, `requirements/${req.clientId}/processed`);
    return this.prisma.requirement.update({
      where: { id },
      data: { processedS3Key: key, status: RequirementStatus.CLIENT_REVIEW },
    });
  }

  // Client approves the processed list with target price
  async clientApprove(id: string, data: { targetPrice: number; totalWeight?: number; category?: string }) {
    const { targetPrice, totalWeight, category } = data;
    return this.prisma.requirement.update({
      where: { id },
      data: {
        targetPrice: Number(targetPrice),
        ...(totalWeight !== undefined && { totalWeight: Number(totalWeight) }),
        ...(category !== undefined && { category }),
        status: RequirementStatus.FINALIZED,
      },
    });
  }

  /**
   * Admin approves the requirement.
   * - Marks requirement as FINALIZED
   * - Creates an Auction (UPCOMING / SEALED_PHASE) linked to it
   * - Sends sealed-bid invitation emails to every vendor the client selected
   */
  async adminApprove(id: string, adminUserId?: string) {
    const req = await this.findOne(id);

    // Mark approved
    const updated = await this.prisma.requirement.update({
      where: { id },
      data: {
        status: RequirementStatus.FINALIZED,
        adminApprovedAt: new Date(),
        adminApprovedById: adminUserId,
      },
    });

    // Create or update the auction linked to this requirement
    const now = new Date();
    const sealedStart = req.sealedPhaseStart ?? now;
    const sealedEnd = req.sealedPhaseEnd ?? new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const auctionStatus = sealedStart <= now ? AuctionStatus.SEALED_PHASE : AuctionStatus.UPCOMING;

    let auction = req.auction;
    if (!auction) {
      auction = await this.prisma.auction.create({
        data: {
          title: req.title,
          category: req.category ?? 'General',
          description: req.description,
          basePrice: req.targetPrice ?? 0,
          targetPrice: req.targetPrice,
          clientId: req.clientId,
          requirementId: req.id,
          status: auctionStatus,
          sealedPhaseStart: sealedStart,
          sealedPhaseEnd: sealedEnd,
        },
      });
    } else {
      await this.prisma.auction.update({
        where: { id: auction.id },
        data: { status: auctionStatus, sealedPhaseStart: sealedStart, sealedPhaseEnd: sealedEnd },
      });
    }

    // Send invitation emails to every selected vendor (User IDs)
    if (req.invitedVendorIds.length > 0) {
      const vendors = await this.prisma.user.findMany({
        where: { id: { in: req.invitedVendorIds } },
        select: { id: true, name: true, email: true },
      });

      const sealedEndStr = sealedEnd.toLocaleString('en-IN', {
        day: '2-digit', month: 'long', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: true,
      });

      await Promise.all(
        vendors.map(v =>
          this.notifications.notifySealedBidInvitation(
            v.email,
            v.name,
            req.title,
            auction!.id,
            sealedEndStr,
          ),
        ),
      );
    }

    return { requirement: updated, auction };
  }

  async getSignedUrl(id: string, field: 'raw' | 'processed') {
    const req = await this.prisma.requirement.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Requirement not found');
    const key = field === 'raw' ? req.rawS3Key : req.processedS3Key;
    if (!key) throw new NotFoundException('File not found');
    return { url: await this.s3.getSignedUrl(key) };
  }
}
