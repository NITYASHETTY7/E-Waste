import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserRole } from '@prisma/client';
import { NotificationService } from '../notifications/notification.service';
import { Public } from '../auth/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private notifications: NotificationService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Get('admin/debug/user/:email')
  async debugUser(@Param('email') email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return { error: 'User not found' };
    return {
      email: user.email,
      isActive: user.isActive,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      role: user.role,
      companyStatus: user.company?.status,
    };
  }

  @Get()
  findAll(@Query('role') role?: UserRole) {
    return this.usersService.findAll(role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Patch(':id/role')
  updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.usersService.updateRole(id, role);
  }

  @Patch(':id/company')
  linkCompany(@Param('id') id: string, @Body('companyId') companyId: string) {
    return this.usersService.linkToCompany(id, companyId);
  }

  // --- Admin Endpoints --- //
  
  @Patch(':id/approve')
  async approveUser(@Param('id') id: string) {
    const user = await this.usersService.approveUser(id);

    // Notify approved user
    await this.notifications.notifyAccountApproved(user.email, user.name);

    return user;
  }

  @Patch(':id/reject')
  async rejectUser(@Param('id') id: string) {
    const updatedUser = await this.usersService.rejectUser(id);
    this.notifications.notifyAccountRejected(updatedUser.email, updatedUser.name).catch(() => {});
    return updatedUser;
  }

  @Patch(':id/hold')
  async holdUser(@Param('id') id: string) {
    const updatedUser = await this.usersService.holdUser(id);
    this.notifications.notifyAccountOnHold(updatedUser.email, updatedUser.name).catch(() => {});
    return updatedUser;
  }

  @Delete('me')
  deleteMe(@Request() req: any) {
    return this.usersService.deleteMe(req.user.userId);
  }
}
