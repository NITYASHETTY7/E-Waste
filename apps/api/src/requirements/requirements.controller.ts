import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  UseGuards,
  Request,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequirementsService } from './requirements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateRequirementDto,
  ClientApproveRequirementDto,
} from './requirements.dto';

@UseGuards(JwtAuthGuard)
@Controller('requirements')
export class RequirementsController {
  constructor(private svc: RequirementsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() body: CreateRequirementDto,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    // invitedVendorIds may come as a comma-separated string or a JSON array
    let invitedVendorIds: string[] = [];
    if (body.invitedVendorIds) {
      try {
        invitedVendorIds =
          typeof body.invitedVendorIds === 'string'
            ? JSON.parse(body.invitedVendorIds)
            : body.invitedVendorIds;
      } catch {
        invitedVendorIds = body.invitedVendorIds
          .split(',')
          .map((s: string) => s.trim())
          .filter(Boolean);
      }
    }

    return this.svc.create({
      ...body,
      clientId: body.clientId || req.user.companyId,
      invitedVendorIds,
      file,
    });
  }

  @Get()
  findAll(@Query('clientId') clientId?: string) {
    return this.svc.findAll(clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  // Admin uploads cleaned / standardised sheet
  @Post(':id/processed-sheet')
  @UseInterceptors(FileInterceptor('file'))
  uploadProcessed(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.svc.uploadProcessedSheet(id, file);
  }

  // Client approves the processed sheet with target price
  @Patch(':id/approve')
  clientApprove(
    @Param('id') id: string,
    @Body() body: ClientApproveRequirementDto,
  ) {
    return this.svc.clientApprove(id, body);
  }

  // Admin approves the listing → creates auction + sends vendor emails
  @Patch(':id/admin-approve')
  adminApprove(@Param('id') id: string, @Request() req: any) {
    return this.svc.adminApprove(id, req.user?.userId);
  }

  @Get(':id/download/:field')
  getSignedUrl(
    @Param('id') id: string,
    @Param('field') field: 'raw' | 'processed',
  ) {
    return this.svc.getSignedUrl(id, field);
  }
}
