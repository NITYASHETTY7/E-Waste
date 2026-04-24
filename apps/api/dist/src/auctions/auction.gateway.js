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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuctionGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const auctions_service_1 = require("./auctions.service");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let AuctionGateway = class AuctionGateway {
    auctionsService;
    prisma;
    server;
    constructor(auctionsService, prisma) {
        this.auctionsService = auctionsService;
        this.prisma = prisma;
    }
    afterInit() {
        console.log('🔌 Auction WebSocket Gateway initialized');
    }
    handleConnection(client) {
        console.log(`WS connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`WS disconnected: ${client.id}`);
    }
    async handleJoin(client, payload) {
        await client.join(payload.auctionId);
        const auction = await this.auctionsService.findOne(payload.auctionId);
        client.emit('auctionState', auction);
    }
    async handleBid(client, payload) {
        const auction = await this.prisma.auction.findUnique({
            where: { id: payload.auctionId },
            include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
        });
        if (!auction || auction.status !== client_1.AuctionStatus.OPEN_PHASE) {
            client.emit('bidError', { message: 'Auction is not in open phase' });
            return;
        }
        const highestBid = auction.bids[0]?.amount || auction.basePrice;
        const minRequired = highestBid + auction.tickSize;
        if (payload.amount < minRequired) {
            client.emit('bidError', { message: `Minimum bid is ₹${minRequired}` });
            return;
        }
        const bid = await this.prisma.bid.create({
            data: {
                auctionId: payload.auctionId,
                vendorId: payload.vendorId,
                amount: payload.amount,
                phase: client_1.BidPhase.OPEN,
            },
            include: { vendor: { select: { id: true, name: true } } },
        });
        await this.recomputeRanks(payload.auctionId);
        const now = new Date();
        const endTime = auction.openPhaseEnd;
        const msToEnd = endTime.getTime() - now.getTime();
        if (msToEnd > 0 && msToEnd < auction.extensionMinutes * 60 * 1000) {
            const updatedAuction = await this.auctionsService.extendTimer(payload.auctionId);
            this.server.to(payload.auctionId).emit('timerExtended', {
                newEndTime: updatedAuction.openPhaseEnd,
                extensionCount: updatedAuction.extensionCount,
            });
        }
        this.server.to(payload.auctionId).emit('newBid', {
            bid,
            leaderboard: await this.getLeaderboard(payload.auctionId),
        });
    }
    async recomputeRanks(auctionId) {
        const bids = await this.prisma.bid.findMany({
            where: { auctionId, phase: client_1.BidPhase.OPEN },
            orderBy: { amount: 'desc' },
        });
        const seen = new Set();
        let rank = 1;
        for (const bid of bids) {
            if (!seen.has(bid.vendorId)) {
                seen.add(bid.vendorId);
                await this.prisma.bid.update({ where: { id: bid.id }, data: { rank } });
                rank++;
            }
        }
    }
    async getLeaderboard(auctionId) {
        const bids = await this.prisma.bid.findMany({
            where: { auctionId, phase: client_1.BidPhase.OPEN },
            orderBy: { amount: 'desc' },
            include: { vendor: { select: { id: true, name: true } } },
        });
        const seen = new Set();
        return bids.filter((b) => {
            if (seen.has(b.vendorId))
                return false;
            seen.add(b.vendorId);
            return true;
        });
    }
};
exports.AuctionGateway = AuctionGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AuctionGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinAuction'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AuctionGateway.prototype, "handleJoin", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('placeBid'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, Object]),
    __metadata("design:returntype", Promise)
], AuctionGateway.prototype, "handleBid", null);
exports.AuctionGateway = AuctionGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: { origin: '*' },
        namespace: '/auction',
    }),
    __metadata("design:paramtypes", [auctions_service_1.AuctionsService,
        prisma_service_1.PrismaService])
], AuctionGateway);
//# sourceMappingURL=auction.gateway.js.map