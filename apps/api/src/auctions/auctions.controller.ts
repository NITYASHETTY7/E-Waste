import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuctionsService } from './auctions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AuctionStatus, UserRole } from '@prisma/client';
import {
  CreateAuctionDto,
  ScheduleAuctionDto,
  SubmitSealedBidDto,
} from './auctions.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auctions')
export class AuctionsController {
  constructor(private svc: AuctionsService) {}

  @Post()
  @Roles(UserRole.ADMIN)
  create(@Body() body: CreateAuctionDto, @Request() req: any) {
    return this.svc.create({
      ...body,
      clientId: body.clientId || req.user.companyId,
    });
  }

  @Get()
  findAll(
    @Query('status') status?: AuctionStatus,
    @Query('clientId') clientId?: string,
  ) {
    return this.svc.findAll(status, clientId);
  }

  // List all bids across auctions (used by frontend fetchAllData)
  @Get('bids')
  findAllBids(@Query('auctionId') auctionId?: string) {
    return this.svc.findAllBids(auctionId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Patch(':id/schedule')
  schedule(@Param('id') id: string, @Body() body: ScheduleAuctionDto) {
    return this.svc.schedule(id, body);
  }

  @Patch(':id/approve-live')
  approveLive(@Param('id') id: string) {
    return this.svc.approveLiveAuction(id);
  }

  @Patch(':id/share-with-client')
  @Roles(UserRole.ADMIN)
  shareWithClient(@Param('id') id: string, @Body('bidIds') bidIds: string[]) {
    return this.svc.shareSealedBids(id, bidIds);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: AuctionStatus) {
    return this.svc.updateStatus(id, status);
  }

  @Post(':id/sealed-bid')
  @UseInterceptors(FileInterceptor('file'))
  sealedBid(
    @Param('id') id: string,
    @Body() body: SubmitSealedBidDto,
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const amount = body.amount;
    if (isNaN(amount))
      throw new BadRequestException('amount is required and must be a number');
    return this.svc.submitSealedBid(
      id,
      req.user.userId,
      amount,
      file,
      body.remarks,
    );
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

  @Patch(':id/approve-quote')
  approveQuote(@Param('id') id: string) {
    return this.svc.approveQuote(id);
  }

  @Patch(':id/reject-quote')
  rejectQuote(@Param('id') id: string, @Body('remarks') remarks: string) {
    return this.svc.rejectQuote(id, remarks);
  }
}
