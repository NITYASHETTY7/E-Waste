import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(role?: UserRole) {
    const users = await this.prisma.user.findMany({
      where: role ? { role } : {},
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    });
    return users.map(({ passwordHash, ...safe }) => safe);
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { company: true },
    });
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { company: true },
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async create(data: {
    email: string;
    name: string;
    passwordHash: string;
    role?: string;
    phone?: string;
  }) {
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    return this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash: data.passwordHash,
        role: (data.role as UserRole) || 'USER',
        phone: data.phone,
      },
    });
  }

  async update(id: string, data: Partial<{ 
    name: string; 
    email: string; 
    phone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    gstNumber: string;
    panNumber: string;
  }>) {
    const user = await this.prisma.user.findUnique({ 
      where: { id },
      include: { company: true }
    });
    if (!user) throw new NotFoundException('User not found');

    const userFields = ['name', 'email', 'phone'];
    const companyFields = ['address', 'city', 'state', 'pincode', 'gstNumber', 'panNumber'];

    const userUpdateData: any = {};
    const companyUpdateData: any = {};

    const rawData = data as Record<string, any>;
    Object.keys(rawData).forEach(key => {
      if (userFields.includes(key)) userUpdateData[key] = rawData[key];
      if (companyFields.includes(key)) companyUpdateData[key] = rawData[key];
    });

    // If email is provided, check if it's actually changing
    if (userUpdateData.email) {
      if (userUpdateData.email.toLowerCase() === user.email.toLowerCase()) {
        delete userUpdateData.email; 
      } else {
        const existing = await this.prisma.user.findUnique({ where: { email: userUpdateData.email } });
        if (existing) throw new ConflictException('Email already in use by another account');
      }
    }

    if (Object.keys(userUpdateData).length > 0) {
      await this.prisma.user.update({
        where: { id },
        data: userUpdateData,
      });
    }

    if (user.companyId && Object.keys(companyUpdateData).length > 0) {
      await this.prisma.company.update({
        where: { id: user.companyId },
        data: companyUpdateData,
      });
    }

    const updated = await this.prisma.user.findUnique({
      where: { id },
      include: { company: true }
    });
    const { passwordHash, ...safe } = updated as any;
    return safe;
  }

  async linkToCompany(userId: string, companyId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { companyId },
    });
  }

  async updateRole(id: string, role: UserRole) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
    });
  }

  async approveUser(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: true },
      include: { company: true },
    });

    if (user.companyId) {
      await this.prisma.company.update({
        where: { id: user.companyId },
        data: { status: 'APPROVED' },
      });
    }

    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async rejectUser(id: string) {
    // Optionally deactivating the user
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: { company: true },
    });

    if (user.companyId) {
      await this.prisma.company.update({
        where: { id: user.companyId },
        data: { status: 'REJECTED' },
      });
    }

    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async holdUser(id: string) {
    const user = await this.prisma.user.update({
      where: { id },
      data: { isActive: false },
      include: { company: true },
    });

    if (user.companyId) {
      await this.prisma.company.update({
        where: { id: user.companyId },
        data: { status: 'BLOCKED' },
      });
    }

    const { passwordHash, ...safe } = user as any;
    return safe;
  }

  async createAdmin(data: { email: string; name: string; password: string }) {
    const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new ConflictException('Email already registered');

    const { hash } = await import('bcryptjs');
    const passwordHash = await hash(data.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    const { passwordHash: _, ...safe } = user as any;
    return safe;
  }

  async deleteMe(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }
}
