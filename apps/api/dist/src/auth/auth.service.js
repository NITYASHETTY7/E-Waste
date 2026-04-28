"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcryptjs"));
const otp_service_1 = require("./otp.service");
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    usersService;
    jwtService;
    otpService;
    prisma;
    constructor(usersService, jwtService, otpService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.otpService = otpService;
        this.prisma = prisma;
    }
    async register(dto) {
        const hash = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create({
            email: dto.email,
            name: dto.name,
            passwordHash: hash,
            role: dto.role || 'USER',
            phone: dto.phone,
        });
        const role = (dto.role || 'USER').toUpperCase();
        if (role === 'CLIENT' || role === 'VENDOR') {
            const company = await this.prisma.company.create({
                data: {
                    name: dto.name,
                    type: role,
                    status: 'PENDING',
                },
            });
            await this.prisma.user.update({
                where: { id: user.id },
                data: { companyId: company.id },
            });
        }
        const otpResult = await this.otpService.sendOtp(dto.email, dto.phone).catch(() => ({ emailSent: false, phoneSent: false }));
        const freshUser = await this.prisma.user.findUnique({ where: { id: user.id }, include: { company: true } });
        return { ...this.buildResponse(freshUser ?? user), otp: otpResult };
    }
    async login(dto) {
        const user = await this.usersService.findByEmail(dto.email);
        if (!user || !dto.password) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const passwordMatch = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordMatch) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        return this.buildResponse(user);
    }
    async getProfile(userId) {
        return this.usersService.findById(userId);
    }
    async markVerified(email, type) {
        const user = await this.usersService.findByEmail(email);
        if (!user)
            return;
        const updateData = type === 'email' ? { emailVerified: true } : { phoneVerified: true };
        await this.prisma.user.update({ where: { id: user.id }, data: updateData });
        const fresh = await this.prisma.user.findUnique({ where: { id: user.id } });
        if (fresh?.emailVerified && fresh?.phoneVerified) {
            await this.prisma.user.update({ where: { id: user.id }, data: { isActive: true } });
        }
    }
    async forgotPassword(email) {
        const user = await this.usersService.findByEmail(email);
        if (!user)
            throw new common_1.NotFoundException('No account found with that email address.');
        const result = await this.otpService.sendOtp(email);
        return { sent: result.emailSent || true, devOtp: result.devEmailOtp };
    }
    async resetPassword(email, otp, newPassword) {
        const verify = await this.otpService.verifyOtp(email, otp, 'email');
        if (!verify.verified)
            throw new common_1.BadRequestException(verify.message);
        const hash = await (await import('bcryptjs')).hash(newPassword, 10);
        await this.prisma.user.update({ where: { email }, data: { passwordHash: hash } });
        return { success: true };
    }
    buildResponse(user) {
        const { passwordHash, ...safeUser } = user;
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: safeUser,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        otp_service_1.OtpService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map