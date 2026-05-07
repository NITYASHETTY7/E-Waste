import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  UploadedFile,
  UseInterceptors,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PickupsService } from './pickups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DocumentType, PickupStatus, UserRole } from '@prisma/client';
import type { Response } from 'express';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller()
export class PickupsController {
  constructor(private svc: PickupsService) {}

  @Post('pickups')
  create(@Body() body: { auctionId: string; paymentId?: string }) {
    return this.svc.create(body.auctionId, body.paymentId);
  }

  @Get('pickups')
  findAll(@Query('status') status?: PickupStatus) {
    return this.svc.findAll(status);
  }

  @Get('pickups/:id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch('pickups/:id/schedule')
  schedule(@Param('id') id: string, @Body('scheduledDate') date: string) {
    return this.svc.schedule(id, date);
  }

  @Post('pickups/:id/upload-form6')
  @UseInterceptors(FileInterceptor('file'))
  uploadForm6(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.svc.uploadDocument(id, file, DocumentType.FORM_6);
  }

  @Post('pickups/:id/upload-weight-slip')
  @UseInterceptors(FileInterceptor('file'))
  uploadWeightSlip(
    @Param('id') id: string,
    @Query('type') type: 'empty' | 'loaded',
    @UploadedFile() file: Express.Multer.File,
  ) {
    const docType = type === 'empty' ? DocumentType.WEIGHT_SLIP_EMPTY : DocumentType.WEIGHT_SLIP_LOADED;
    return this.svc.uploadDocument(id, file, docType);
  }

  @Post('pickups/:id/upload-compliance')
  @UseInterceptors(FileInterceptor('file'))
  uploadCompliance(
    @Param('id') id: string,
    @Query('type') type: 'recycling' | 'disposal',
    @UploadedFile() file: Express.Multer.File,
  ) {
    const docType = type === 'recycling' ? DocumentType.RECYCLING_CERTIFICATE : DocumentType.DISPOSAL_CERTIFICATE;
    return this.svc.uploadDocument(id, file, docType);
  }

  @Get('pickups/:id/documents/download-all')
  async downloadAllDocs(@Param('id') id: string, @Res() res: Response) {
    const stream = await this.svc.downloadAllDocumentsZip(id);
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="EcoLoop_Compliance_${id}.zip"`,
    });
    stream.pipe(res);
  }

  @Patch('admin/pickups/:id/verify-compliance')
  @Roles(UserRole.ADMIN)
  verifyCompliance(@Param('id') id: string) {
    return this.svc.verifyCompliance(id);
  }

  @Patch('admin/pickups/:id/complete')
  @Roles(UserRole.ADMIN)
  complete(@Param('id') id: string, @Body('adminNotes') notes?: string) {
    return this.svc.completePickup(id, notes);
  }
}
