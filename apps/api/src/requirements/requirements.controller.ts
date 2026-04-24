import {
  Controller, Get, Post, Patch, Param, Query, Body,
  UseGuards, Request, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequirementsService } from './requirements.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('requirements')
export class RequirementsController {
  constructor(private svc: RequirementsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  create(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File,
    @Request() req: any,
  ) {
    return this.svc.create({ ...body, clientId: body.clientId || req.user.companyId, file });
  }

  @Get()
  findAll(@Query('clientId') clientId?: string) {
    return this.svc.findAll(clientId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.svc.findOne(id);
  }

  @Post(':id/processed-sheet')
  @UseInterceptors(FileInterceptor('file'))
  uploadProcessed(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.svc.uploadProcessedSheet(id, file);
  }

  @Patch(':id/approve')
  clientApprove(@Param('id') id: string, @Body() body: any) {
    return this.svc.clientApprove(id, body);
  }

  @Get(':id/download/:field')
  getSignedUrl(@Param('id') id: string, @Param('field') field: 'raw' | 'processed') {
    return this.svc.getSignedUrl(id, field);
  }
}
