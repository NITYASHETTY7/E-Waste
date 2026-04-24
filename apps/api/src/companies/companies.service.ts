import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CompanyStatus, CompanyType, DocumentType } from '@prisma/client';

@Injectable()
export class CompaniesService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  async create(data: {
    name: string;
    type: CompanyType;
    gstNumber?: string;
    panNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) {
    return this.prisma.company.create({ data });
  }

  async findAll(type?: CompanyType, status?: CompanyStatus) {
    return this.prisma.company.findMany({
      where: {
        ...(type && { type }),
        ...(status && { status }),
      },
      include: {
        users: { select: { id: true, name: true, email: true, role: true } },
        kycDocuments: true,
      },
    });
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
    return this.prisma.company.update({ where: { id }, data });
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

  async updateRating(vendorId: string, newRating: number) {
    const company = await this.prisma.company.findUnique({ where: { id: vendorId } });
    if (!company) throw new NotFoundException('Vendor not found');

    const totalRatings = company.ratingCount + 1;
    const avgRating = ((company.rating || 0) * company.ratingCount + newRating) / totalRatings;

    return this.prisma.company.update({
      where: { id: vendorId },
      data: { rating: avgRating, ratingCount: totalRatings },
    });
  }
}
