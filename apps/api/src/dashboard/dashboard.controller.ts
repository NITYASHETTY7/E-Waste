import { Controller, Get, Param, UseGuards, Request } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('dashboard')
export class DashboardController {
  constructor(private svc: DashboardService) {}

  @Get('admin')
  adminStats() {
    return this.svc.getAdminStats();
  }

  @Get('client/:companyId')
  clientStats(@Param('companyId') companyId: string) {
    return this.svc.getClientStats(companyId);
  }

  @Get('vendor/:companyId')
  vendorStats(@Param('companyId') companyId: string) {
    return this.svc.getVendorStats(companyId);
  }
}
