import {
  Controller, Get, Post, Patch, Param, Body, Query,
  UseGuards, Request, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuctionStatus } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('auctions')
export class AuctionsController {
  constructor(private svc: AuctionsService) {}

  @Post()
  create(@Body() body: any, @Request() req: any) {
    return this.svc.create({ ...body, clientId: body.clientId || req.user.companyId });
  }

  @Get()
  findAll(@Query('status') status?: AuctionStatus, @Query('clientId') clientId?: string) {
    return this.svc.findAll(status, clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id/schedule')
  schedule(@Param('id') id: string, @Body() body: any) {
    return this.svc.schedule(id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: AuctionStatus) {
    return this.svc.updateStatus(id, status);
  }

  @Post(':id/sealed-bid')
  @UseInterceptors(FileInterceptor('file'))
  sealedBid(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.svc.submitSealedBid(id, req.user.userId, parseFloat(body.amount), file, body.remarks);
  }

  @Patch(':id/winner')
  selectWinner(@Param('id') id: string, @Body('vendorId') vendorId: string) {
    return this.svc.selectWinner(id, vendorId);
  }

  @Post(':id/final-quote')
  @UseInterceptors(FileInterceptor('file'))
  uploadFinalQuote(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: 'FINAL_QUOTE' | 'LETTERHEAD_QUOTATION',
  ) {
    return this.svc.uploadFinalQuote(id, file, type);
  }
}
