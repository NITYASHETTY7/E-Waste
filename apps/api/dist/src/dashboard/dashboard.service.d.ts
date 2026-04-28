import { PrismaService } from '../prisma/prisma.service';
export declare class DashboardService {
    private prisma;
    constructor(prisma: PrismaService);
    getAdminStats(): Promise<{
        totalClients: number;
        totalVendors: number;
        pendingApprovals: number;
        activeAuctions: number;
        totalRevenue: number;
        pendingPayments: number;
        completedDeals: number;
    }>;
    getClientStats(clientId: string): Promise<{
        myAuctions: number;
        activeAuctions: number;
        completedAuctions: number;
        recentAuctions: ({
            winner: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.CompanyType;
                status: import("@prisma/client").$Enums.CompanyStatus;
                gstNumber: string | null;
                panNumber: string | null;
                address: string | null;
                city: string | null;
                state: string | null;
                pincode: string | null;
                rating: number | null;
                ratingCount: number;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.AuctionStatus;
            title: string;
            description: string | null;
            targetPrice: number | null;
            category: string;
            clientId: string;
            requirementId: string | null;
            basePrice: number;
            tickSize: number;
            maxTicks: number;
            extensionMinutes: number;
            sealedPhaseStart: Date | null;
            sealedPhaseEnd: Date | null;
            openPhaseStart: Date | null;
            openPhaseEnd: Date | null;
            extensionCount: number;
            quoteApproved: boolean | null;
            quoteRemarks: string | null;
            winnerId: string | null;
        })[];
    }>;
    getVendorStats(vendorId: string): Promise<{
        wonAuctions: number;
        activeBids: number;
        pendingPickups: number;
        recentWins: ({
            client: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                type: import("@prisma/client").$Enums.CompanyType;
                status: import("@prisma/client").$Enums.CompanyStatus;
                gstNumber: string | null;
                panNumber: string | null;
                address: string | null;
                city: string | null;
                state: string | null;
                pincode: string | null;
                rating: number | null;
                ratingCount: number;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.AuctionStatus;
            title: string;
            description: string | null;
            targetPrice: number | null;
            category: string;
            clientId: string;
            requirementId: string | null;
            basePrice: number;
            tickSize: number;
            maxTicks: number;
            extensionMinutes: number;
            sealedPhaseStart: Date | null;
            sealedPhaseEnd: Date | null;
            openPhaseStart: Date | null;
            openPhaseEnd: Date | null;
            extensionCount: number;
            quoteApproved: boolean | null;
            quoteRemarks: string | null;
            winnerId: string | null;
        })[];
    }>;
}
