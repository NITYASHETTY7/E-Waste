import {
  Controller, Get, Post, Patch, Param, Body,
  Query, UseGuards, Request, UploadedFiles, UseInterceptors
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuditsService } from './audits.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('audits')
export class AuditsController {
  constructor(private svc: AuditsService) {}

  @Post('invite')
  invite(@Body() body: { requirementId: string; vendorIds: string[] }) {
    return this.svc.inviteVendors(body.requirementId, body.vendorIds);
  }

  @Get('invitations')
  findAll(
    @Query('vendorId') vendorId?: string,
    @Query('requirementId') requirementId?: string,
  ) {
    return this.svc.findAllInvitations(vendorId, requirementId);
  }

  @Get('invitations/:id')
  findOne(@Param('id') id: string) {
    return this.svc.findOneInvitation(id);
  }

  @Patch('invitations/:id/respond')
  respond(@Param('id') id: string, @Body('status') status: 'ACCEPTED' | 'REJECTED') {
    return this.svc.respondToInvitation(id, status);
  }

  @Patch('invitations/:id/spoc')
  shareSpoc(@Param('id') id: string, @Body() body: any) {
    return this.svc.shareSpoc(id, body);
  }

  @Post('invitations/:id/report')
  @UseInterceptors(FilesInterceptor('photos'))
  submitReport(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: any,
    @UploadedFiles() photos: Express.Multer.File[],
  ) {
    return this.svc.submitReport(id, {
      productMatch: body.productMatch === 'true',
      remarks: body.remarks,
      vendorUserId: req.user.userId,
      photos,
    });
  }
}
