// Live Auction Gateway — WebSocket for real-time open bidding
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionsService } from './auctions.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuctionStatus, BidPhase } from '@prisma/client';

@WebSocketGateway({
  cors: { origin: '*' },
  namespace: '/auction',
})
export class AuctionGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private auctionsService: AuctionsService,
    private prisma: PrismaService,
  ) {}

  afterInit() {
    console.log('🔌 Auction WebSocket Gateway initialized');
  }

  handleConnection(client: Socket) {
    console.log(`WS connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`WS disconnected: ${client.id}`);
  }

  // Vendor joins an auction room
  @SubscribeMessage('joinAuction')
  async handleJoin(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { auctionId: string },
  ) {
    await client.join(payload.auctionId);
    const auction = await this.auctionsService.findOne(payload.auctionId);
    client.emit('auctionState', auction);
  }

  // Vendor places a live bid
  @SubscribeMessage('placeBid')
  async handleBid(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: { auctionId: string; vendorId: string; amount: number },
  ) {
    const vendorUser = await this.prisma.user.findUnique({
      where: { id: payload.vendorId },
      include: { company: true },
    });

    if (vendorUser?.company?.isLocked) {
      client.emit('bidError', { message: 'Your account is locked. Please contact admin.' });
      return;
    }

    const auction = await this.prisma.auction.findUnique({
      where: { id: payload.auctionId },
      include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
    });

    if (!auction || auction.status !== AuctionStatus.OPEN_PHASE) {
      client.emit('bidError', { message: 'Auction is not in open phase' });
      return;
    }

    const highestBid = auction.bids[0]?.amount || auction.basePrice;
    const minRequired = highestBid + auction.tickSize;

    if (payload.amount < minRequired) {
      client.emit('bidError', { message: `Minimum bid is ₹${minRequired}` });
      return;
    }

    // Create bid
    const bid = await this.prisma.bid.create({
      data: {
        auctionId: payload.auctionId,
        vendorId: payload.vendorId,
        amount: payload.amount,
        phase: BidPhase.OPEN,
      },
      include: { vendor: { select: { id: true, name: true } } },
    });

    // Recompute ranks
    await this.recomputeRanks(payload.auctionId);

    // Check if we're in last 3 minutes → extend timer
    const now = new Date();
    const endTime = auction.openPhaseEnd!;
    const msToEnd = endTime.getTime() - now.getTime();
    if (msToEnd > 0 && msToEnd < auction.extensionMinutes * 60 * 1000) {
      const updatedAuction = await this.auctionsService.extendTimer(
        payload.auctionId,
      );
      this.server.to(payload.auctionId).emit('timerExtended', {
        newEndTime: updatedAuction.openPhaseEnd,
        extensionCount: updatedAuction.extensionCount,
      });
    }

    // Broadcast new bid to all in the room
    this.server.to(payload.auctionId).emit('newBid', {
      bid,
      leaderboard: await this.getLeaderboard(payload.auctionId),
    });
  }

  private async recomputeRanks(auctionId: string) {
    const bids = await this.prisma.bid.findMany({
      where: { auctionId, phase: BidPhase.OPEN },
      orderBy: { amount: 'desc' },
    });

    // Group by vendor — keep highest bid per vendor
    const seen = new Set<string>();
    let rank = 1;
    for (const bid of bids) {
      if (!seen.has(bid.vendorId)) {
        seen.add(bid.vendorId);
        await this.prisma.bid.update({ where: { id: bid.id }, data: { rank } });
        rank++;
      }
    }
  }

  async getLeaderboard(auctionId: string) {
    // Return top bid per vendor, sorted by amount desc
    const bids = await this.prisma.bid.findMany({
      where: { auctionId, phase: BidPhase.OPEN },
      orderBy: { amount: 'desc' },
      include: { vendor: { select: { id: true, name: true } } },
    });
    const seen = new Set<string>();
    return bids.filter((b) => {
      if (seen.has(b.vendorId)) return false;
      seen.add(b.vendorId);
      return true;
    });
  }
}
