import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuctionsService } from './auctions.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class AuctionGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private auctionsService;
    private prisma;
    server: Server;
    constructor(auctionsService: AuctionsService, prisma: PrismaService);
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoin(client: Socket, payload: {
        auctionId: string;
    }): Promise<void>;
    handleBid(client: Socket, payload: {
        auctionId: string;
        vendorId: string;
        amount: number;
    }): Promise<void>;
    private recomputeRanks;
    getLeaderboard(auctionId: string): Promise<({
        vendor: {
            name: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        vendorId: string;
        remarks: string | null;
        amount: number;
        phase: import("@prisma/client").$Enums.BidPhase;
        rank: number | null;
        priceSheetS3Key: string | null;
        priceSheetS3Bucket: string | null;
        priceSheetFileName: string | null;
        auctionId: string;
    })[]>;
}
