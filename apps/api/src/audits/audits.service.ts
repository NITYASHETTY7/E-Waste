import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { AuditStatus } from '@prisma/client';

@Injectable()
export class AuditsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  async inviteVendors(requirementId: string, vendorIds: string[]) {
    const invitations = await Promise.all(
      vendorIds.map((vendorId) =>
        this.prisma.auditInvitation.upsert({
          where: { requirementId_vendorId: { requirementId, vendorId } },
          create: { requirementId, vendorId },
          update: { status: AuditStatus.INVITED },
        }),
      ),
    );
    return invitations;
  }

  async findAllInvitations(vendorId?: string, requirementId?: string) {
    return this.prisma.auditInvitation.findMany({
      where: {
        ...(vendorId && { vendorId }),
        ...(requirementId && { requirementId }),
      },
      include: {
        requirement: { include: { client: true } },
        vendor: true,
        report: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOneInvitation(id: string) {
    const inv = await this.prisma.auditInvitation.findUnique({
      where: { id },
      include: {
        requirement: { include: { client: true } },
        vendor: true,
        report: { include: { photos: true } },
      },
    });
    if (!inv) throw new NotFoundException('Audit invitation not found');
    return inv;
  }

  async respondToInvitation(id: string, status: 'ACCEPTED' | 'REJECTED') {
    return this.prisma.auditInvitation.update({
      where: { id },
      data: { status: status as AuditStatus },
    });
  }

  async shareSpoc(
    id: string,
    data: { siteAddress: string; spocName: string; spocPhone: string; scheduledAt: string },
  ) {
    return this.prisma.auditInvitation.update({
      where: { id },
      data: {
        siteAddress: data.siteAddress,
        spocName: data.spocName,
        spocPhone: data.spocPhone,
        scheduledAt: new Date(data.scheduledAt),
        status: AuditStatus.SCHEDULED,
      },
    });
  }

  async submitReport(
    invitationId: string,
    data: {
      productMatch: boolean;
      remarks?: string;
      vendorUserId: string;
      photos?: Express.Multer.File[];
    },
  ) {
    const report = await this.prisma.auditReport.upsert({
      where: { invitationId },
      create: {
        invitationId,
        productMatch: data.productMatch,
        remarks: data.remarks,
        completedAt: new Date(),
        vendorUserId: data.vendorUserId,
      },
      update: {
        productMatch: data.productMatch,
        remarks: data.remarks,
        completedAt: new Date(),
      },
    });

    if (data.photos && data.photos.length > 0) {
      await Promise.all(
        data.photos.map((photo) =>
          this.s3
            .upload(photo, `audits/${invitationId}`, false)
            .then(({ key, bucket }) =>
              this.prisma.auditPhoto.create({
                data: {
                  s3Key: key,
                  s3Bucket: bucket,
                  fileName: photo.originalname,
                  mimeType: photo.mimetype,
                  auditReportId: report.id,
                },
              }),
            ),
        ),
      );
    }

    await this.prisma.auditInvitation.update({
      where: { id: invitationId },
      data: { status: AuditStatus.COMPLETED },
    });

    return report;
  }
}
