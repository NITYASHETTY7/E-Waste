import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PickupsService } from './pickups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentType, PickupStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('pickups')
export class PickupsController {
  constructor(private svc: PickupsService) {}

  @Post()
  create(@Body() body: { auctionId: string; paymentId?: string }) {
    return this.svc.create(body.auctionId, body.paymentId);
  }

  @Get()
  findAll(@Query('status') status?: PickupStatus) {
    return this.svc.findAll(status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id/schedule')
  schedule(@Param('id') id: string, @Body('scheduledDate') date: string) {
    return this.svc.schedule(id, date);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: DocumentType,
  ) {
    return this.svc.uploadDocument(id, file, type);
  }

  @Patch(':id/complete')
  complete(@Param('id') id: string, @Body('adminNotes') notes?: string) {
    return this.svc.completePickup(id, notes);
  }
}
