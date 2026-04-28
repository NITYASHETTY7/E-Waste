"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(role) {
        const users = await this.prisma.user.findMany({
            where: role ? { role } : {},
            include: { company: true },
            orderBy: { createdAt: 'desc' },
        });
        return users.map(({ passwordHash, ...safe }) => safe);
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({
            where: { email },
            include: { company: true },
        });
    }
    async findById(id) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            include: { company: true },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        const { passwordHash, ...safe } = user;
        return safe;
    }
    async create(data) {
        const existing = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (existing)
            throw new common_1.ConflictException('Email already registered');
        return this.prisma.user.create({
            data: {
                email: data.email,
                name: data.name,
                passwordHash: data.passwordHash,
                role: data.role || 'USER',
                phone: data.phone,
            },
        });
    }
    async linkToCompany(userId, companyId) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { companyId },
        });
    }
    async updateRole(userId, role) {
        return this.prisma.user.update({
            where: { id: userId },
            data: { role },
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map