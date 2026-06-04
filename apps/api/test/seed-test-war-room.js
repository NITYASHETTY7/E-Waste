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
const uuid_1 = require("uuid");
const fs = __importStar(require("fs"));
const prisma = new client_1.PrismaClient();
const AUCTION_ID = process.argv.find(arg => arg.startsWith('--auctionId='))?.split('=')[1];
async function seed() {
    if (!AUCTION_ID) {
        console.error('Usage: npx ts-node seed-test-war-room.ts --auctionId=<id>');
        process.exit(1);
    }
    console.log(`🏗️ Seeding 20 Shortlisted Vendors for Auction: ${AUCTION_ID}`);
    const auction = await prisma.auction.findUnique({ where: { id: AUCTION_ID } });
    if (!auction)
        throw new Error('Auction not found');
    const vendors = [];
    const botCompany = await prisma.company.create({
        data: {
            name: `Bot Recyclers Corp`,
            type: 'VENDOR',
            status: 'APPROVED',
        }
    });
    for (let i = 0; i < 20; i++) {
        const email = `bot-${i}-${(0, uuid_1.v4)().substring(0, 8)}@ecoloop-test.com`;
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash: 'hashed_password',
                name: `Bot Bidder #${i}`,
                role: client_1.UserRole.VENDOR,
                companyId: botCompany.id,
                isActive: true,
            }
        });
        await prisma.bid.create({
            data: {
                auctionId: AUCTION_ID,
                vendorId: user.id,
                amount: auction.basePrice,
                phase: client_1.BidPhase.SEALED,
                isShortlisted: true,
                clientStatus: 'approved',
            }
        });
        vendors.push({ id: user.id, name: user.name });
        if (i % 10 === 0)
            console.log(`Created ${i} bots...`);
    }
    fs.writeFileSync('test-vendors.json', JSON.stringify(vendors, null, 2));
    console.log('✅ Done! 20 vendors seeded. Data saved to test-vendors.json');
}
seed().catch(console.error).finally(() => prisma.$disconnect());
//# sourceMappingURL=seed-test-war-room.js.map