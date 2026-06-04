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
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding demo users...');
    const hash = (pw) => bcrypt.hash(pw, 10);
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminHash = await hash('password');
    await prisma.user.upsert({
        where: { email: adminEmail },
        update: { passwordHash: adminHash, isActive: true, emailVerified: true },
        create: {
            email: adminEmail,
            name: 'Super Admin',
            passwordHash: adminHash,
            role: 'ADMIN',
            isActive: true,
            emailVerified: true,
        },
    });
    console.log(`✅ Admin seeded: ${adminEmail} / password`);
    let vendorCompany = await prisma.company.findFirst({ where: { name: 'Green Recyclers Pvt Ltd' } });
    if (!vendorCompany) {
        vendorCompany = await prisma.company.create({
            data: { name: 'Green Recyclers Pvt Ltd', type: 'VENDOR', status: 'APPROVED' },
        });
    }
    const vendorHash = await hash('password');
    await prisma.user.upsert({
        where: { email: 'vendor@weconnect.com' },
        update: { passwordHash: vendorHash, isActive: true, emailVerified: true, phoneVerified: true, companyId: vendorCompany.id },
        create: {
            email: 'vendor@weconnect.com',
            name: 'Green Recyclers Pvt Ltd',
            passwordHash: vendorHash,
            role: 'VENDOR',
            isActive: true,
            emailVerified: true,
            phoneVerified: true,
            companyId: vendorCompany.id,
        },
    });
    console.log('✅ Vendor seeded: vendor@weconnect.com / password');
    let clientCompany = await prisma.company.findFirst({ where: { name: 'Tech Corp Ltd' } });
    if (!clientCompany) {
        clientCompany = await prisma.company.create({
            data: { name: 'Tech Corp Ltd', type: 'CLIENT', status: 'APPROVED' },
        });
    }
    const clientHash = await hash('password');
    await prisma.user.upsert({
        where: { email: 'client@weconnect.com' },
        update: { passwordHash: clientHash, isActive: true, emailVerified: true, phoneVerified: true, companyId: clientCompany.id },
        create: {
            email: 'client@weconnect.com',
            name: 'Tech Corp Ltd',
            passwordHash: clientHash,
            role: 'CLIENT',
            isActive: true,
            emailVerified: true,
            phoneVerified: true,
            companyId: clientCompany.id,
        },
    });
    console.log('✅ Client seeded: client@weconnect.com / password');
    console.log('🎉 Seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map