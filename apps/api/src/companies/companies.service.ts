import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CompanyStatus, CompanyType, DocumentType } from '@prisma/client';
import { NotificationService } from '../notifications/notification.service';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
    private notifications: NotificationService,
  ) {}

  async create(
    data: {
      name: string;
      type: CompanyType;
      gstNumber?: string;
      panNumber?: string;
      address?: string;
      city?: string;
      state?: string;
      pincode?: string;
    },
    userId?: string,
  ) {
    const company = await this.prisma.company.create({ data });

    if (userId) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { companyId: company.id },
      });
    }

    return company;
  }

  async findAll(type?: CompanyType, status?: CompanyStatus) {
    const companies = await this.prisma.company.findMany({
      where: {
        ...(type && { type }),
        ...(status && { status }),
      },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        kycDocuments: true,
      },
    });

    return Promise.all(
      companies.map(async (company) => {
        const docs = await Promise.all(
          company.kycDocuments.map(async (doc) => ({
            ...doc,
            signedUrl: await this.s3.getSignedUrl(doc.s3Key, doc.s3Bucket).catch(() => null),
          })),
        );
        return { ...company, kycDocuments: docs };
      }),
    );
  }

  async findOne(id: string) {
    const company = await this.prisma.company.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        kycDocuments: true,
      },
    });
    if (!company) throw new NotFoundException('Company not found');

    const docs = await Promise.all(
      company.kycDocuments.map(async (doc) => ({
        ...doc,
        signedUrl: await this.s3.getSignedUrl(doc.s3Key, doc.s3Bucket),
      })),
    );

    return { ...company, kycDocuments: docs };
  }

  async updateStatus(id: string, status: CompanyStatus) {
    return this.prisma.company.update({ where: { id }, data: { status } });
  }

  async update(id: string, data: any) {
    // Strip relations and read-only fields that Prisma rejects
    const {
      id: _id,
      users: _users,
      kycDocuments: _kycDocuments,
      auctions: _auctions,
      wonAuctions: _wonAuctions,
      auditInvitations: _auditInvitations,
      requirements: _requirements,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      ...safeData
    } = data;
    return this.prisma.company.update({ where: { id }, data: safeData });
  }

  async uploadKycDocument(
    companyId: string,
    file: Express.Multer.File,
    type: DocumentType,
  ) {
    const { key, bucket } = await this.s3.upload(file, `kyc/${companyId}`);
    return this.prisma.kycDocument.create({
      data: {
        type,
        s3Key: key,
        s3Bucket: bucket,
        fileName: file.originalname,
        mimeType: file.mimetype,
        companyId,
      },
    });
  }

  async getSignedUrl(s3Key: string, s3Bucket?: string) {
    const url = await this.s3.getSignedUrl(s3Key, s3Bucket);
    return { url };
  }

  async updateRating(vendorId: string, newRating: number) {
    const company = await this.prisma.company.findUnique({
      where: { id: vendorId },
    });
    if (!company) throw new NotFoundException('Vendor not found');

    const totalRatings = company.ratingCount + 1;
    const avgRating =
      ((company.rating || 0) * company.ratingCount + newRating) / totalRatings;

    return this.prisma.company.update({
      where: { id: vendorId },
      data: { rating: avgRating, ratingCount: totalRatings },
    });
  }

  // --- Admin Risk Control ---

  async lockCompany(id: string, reason: string) {
    const company = await this.prisma.company.update({
      where: { id },
      data: { isLocked: true, lockReason: reason },
      include: { users: true }
    });

    const primaryUser = company.users[0];
    if (primaryUser?.email) {
      await this.notifications.sendEmail({
        to: primaryUser.email,
        subject: `[WeConnect] Urgent: Your account has been locked`,
        body: `
          <h2>Account Locked</h2>
          <p>Hello ${primaryUser.name || company.name},</p>
          <p>Your company account on WeConnect has been locked by an administrator.</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>You will not be able to place bids or participate in auctions until this issue is resolved. Please contact support immediately.</p>
        `
      }).catch(() => {});
    }

    return company;
  }

  async unlockCompany(id: string) {
    const company = await this.prisma.company.update({
      where: { id },
      data: { isLocked: false, lockReason: null },
      include: { users: true }
    });

    const primaryUser = company.users[0];
    if (primaryUser?.email) {
      await this.notifications.sendEmail({
        to: primaryUser.email,
        subject: `[WeConnect] Your account has been unlocked`,
        body: `
          <h2>Account Unlocked</h2>
          <p>Hello ${primaryUser.name || company.name},</p>
          <p>Your company account has been unlocked. You may now resume full platform activity.</p>
        `
      }).catch(() => {});
    }

    return company;
  }

  async applyPenalty(id: string, amount: number, reason: string) {
    const company = await this.prisma.company.findUnique({ where: { id } });
    if (!company) throw new NotFoundException('Company not found');

    const currentPenalty = company.penaltyAmount || 0;

    const updated = await this.prisma.company.update({
      where: { id },
      data: { penaltyAmount: currentPenalty + amount },
      include: { users: true }
    });

    const primaryUser = updated.users[0];
    if (primaryUser?.email) {
      await this.notifications.sendEmail({
        to: primaryUser.email,
        subject: `[WeConnect] Penalty Applied to Account`,
        body: `
          <h2>Penalty Notice</h2>
          <p>Hello ${primaryUser.name || company.name},</p>
          <p>A financial penalty has been applied to your account.</p>
          <p><strong>Amount:</strong> ₹${amount.toLocaleString('en-IN')}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p>Please clear this penalty immediately to avoid suspension of services.</p>
        `
      }).catch(() => {});
    }

    return updated;
  }
}
