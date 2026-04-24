import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PaymentStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('payments')
export class PaymentsController {
  constructor(private svc: PaymentsService) {}

  @Post('auction/:auctionId')
  create(@Param('auctionId') auctionId: string, @Body('clientAmount') amount: number) {
    return this.svc.createForAuction(auctionId, amount);
  }

  @Get()
  findAll(@Query('status') status?: PaymentStatus) {
    return this.svc.findAll(status);
  }

  @Get('auction/:auctionId')
  findOne(@Param('auctionId') auctionId: string) {
    return this.svc.findByAuction(auctionId);
  }

  @Post('auction/:auctionId/proof')
  @UseInterceptors(FileInterceptor('file'))
  uploadProof(
    @Param('auctionId') auctionId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('utrNumber') utrNumber?: string,
  ) {
    return this.svc.uploadProof(auctionId, file, utrNumber);
  }

  @Patch('auction/:auctionId/confirm')
  confirm(@Param('auctionId') auctionId: string, @Body('adminNotes') notes?: string) {
    return this.svc.confirm(auctionId, notes);
  }
}
