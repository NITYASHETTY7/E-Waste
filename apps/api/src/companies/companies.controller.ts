import {
  Controller, Get, Post, Patch, Body, Param, Query,
  UseGuards, UploadedFile, UseInterceptors
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CompanyStatus, CompanyType, DocumentType } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('companies')
export class CompaniesController {
  constructor(private companiesService: CompaniesService) {}

  @Post()
  create(@Body() body: any) {
    return this.companiesService.create(body);
  }

  @Get()
  findAll(
    @Query('type') type?: CompanyType,
    @Query('status') status?: CompanyStatus,
  ) {
    return this.companiesService.findAll(type, status);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.companiesService.update(id, body);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body('status') status: CompanyStatus) {
    return this.companiesService.updateStatus(id, status);
  }

  @Post(':id/documents')
  @UseInterceptors(FileInterceptor('file'))
  uploadDocument(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('type') type: DocumentType,
  ) {
    return this.companiesService.uploadKycDocument(id, file, type);
  }

  @Patch(':id/rating')
  updateRating(@Param('id') id: string, @Body('rating') rating: number) {
    return this.companiesService.updateRating(id, rating);
  }
}
