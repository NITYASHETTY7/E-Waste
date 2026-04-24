import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { PickupStatus, DocumentType } from '@prisma/client';

@Injectable()
export class PickupsService {
  constructor(
    private prisma: PrismaService,
    private s3: S3Service,
  ) {}

  async create(auctionId: string, paymentId?: string) {
    return this.prisma.pickup.create({ data: { auctionId, paymentId } });
  }

  async findAll(status?: PickupStatus) {
    return this.prisma.pickup.findMany({
      where: status ? { status } : {},
      include: {
        auction: { include: { client: true, winner: true } },
        pickupDocs: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const pickup = await this.prisma.pickup.findUnique({
      where: { id },
      include: {
        auction: { include: { client: true, winner: true } },
        pickupDocs: true,
        payment: true,
      },
    });
    if (!pickup) throw new NotFoundException('Pickup not found');

    const docs = await Promise.all(
      pickup.pickupDocs.map(async (doc) => ({
        ...doc,
        signedUrl: await this.s3.getSignedUrl(doc.s3Key, doc.s3Bucket),
      })),
    );
    return { ...pickup, pickupDocs: docs };
  }

  async schedule(id: string, scheduledDate: string) {
    return this.prisma.pickup.update({
      where: { id },
      data: { scheduledDate: new Date(scheduledDate), status: PickupStatus.SCHEDULED },
    });
  }

  async uploadDocument(id: string, file: Express.Multer.File, type: DocumentType) {
    const pickup = await this.prisma.pickup.findUnique({ where: { id } });
    if (!pickup) throw new NotFoundException('Pickup not found');

    const { key, bucket } = await this.s3.upload(file, `pickups/${id}`);
    const doc = await this.prisma.pickupDocument.create({
      data: {
        type,
        s3Key: key,
        s3Bucket: bucket,
        fileName: file.originalname,
        mimeType: file.mimetype,
        pickupId: id,
      },
    });

    const allDocs = await this.prisma.pickupDocument.findMany({ where: { pickupId: id } });
    const hasRecycling = allDocs.some((d) => d.type === DocumentType.RECYCLING_CERTIFICATE);
    const hasDisposal = allDocs.some((d) => d.type === DocumentType.DISPOSAL_CERTIFICATE);
    if (hasRecycling && hasDisposal) {
      await this.prisma.pickup.update({
        where: { id },
        data: { status: PickupStatus.DOCUMENTS_UPLOADED },
      });
    }

    return doc;
  }

  async completePickup(id: string, adminNotes?: string) {
    return this.prisma.pickup.update({
      where: { id },
      data: { status: PickupStatus.COMPLETED, adminNotes },
    });
  }
}
