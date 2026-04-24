import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { RequirementStatus } from '@prisma/client';

@Injectable()
export class RequirementsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  // Client uploads a new requirement (Excel sheet)
  async create(data: {
    title: string;
    description?: string;
    clientId: string;
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
      },
    });
  }

  async findAll(clientId?: string) {
    return this.prisma.requirement.findMany({
      where: clientId ? { clientId } : {},
      include: { client: true, auditInvitations: true, auction: true },
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

  // Admin uploads the cleaned/processed sheet
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
    return this.prisma.requirement.update({
      where: { id },
      data: {
        ...data,
        status: RequirementStatus.FINALIZED,
      },
    });
  }

  async getSignedUrl(id: string, field: 'raw' | 'processed') {
    const req = await this.prisma.requirement.findUnique({ where: { id } });
    if (!req) throw new NotFoundException('Requirement not found');
    const key = field === 'raw' ? req.rawS3Key : req.processedS3Key;
    if (!key) throw new NotFoundException('File not found');
    return { url: await this.s3.getSignedUrl(key) };
  }
}
