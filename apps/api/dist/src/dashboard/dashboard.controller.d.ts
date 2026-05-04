import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private svc;
    constructor(svc: DashboardService);
    adminStats(): Promise<{
        totalClients: number;
        totalVendors: number;
        pendingApprovals: number;
        activeAuctions: number;
        totalRevenue: number;
        pendingPayments: number;
        completedDeals: number;
    }>;
    clientStats(companyId: string): Promise<{
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
                bankAccountHolder: string | null;
                bankName: string | null;
                bankAccountNumber: string | null;
                bankIfscCode: string | null;
                bankAccountType: string | null;
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
            sealedPhaseStart: Date | null;
            sealedPhaseEnd: Date | null;
            clientId: string;
            basePrice: number;
            tickSize: number;
            maxTicks: number;
            extensionMinutes: number;
            openPhaseStart: Date | null;
            openPhaseEnd: Date | null;
            extensionCount: number;
            winnerId: string | null;
            requirementId: string | null;
            quoteApproved: boolean | null;
            quoteRemarks: string | null;
        })[];
    }>;
    vendorStats(companyId: string): Promise<{
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
                bankAccountHolder: string | null;
                bankName: string | null;
                bankAccountNumber: string | null;
                bankIfscCode: string | null;
                bankAccountType: string | null;
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
            sealedPhaseStart: Date | null;
            sealedPhaseEnd: Date | null;
            clientId: string;
            basePrice: number;
            tickSize: number;
            maxTicks: number;
            extensionMinutes: number;
            openPhaseStart: Date | null;
            openPhaseEnd: Date | null;
            extensionCount: number;
            winnerId: string | null;
            requirementId: string | null;
            quoteApproved: boolean | null;
            quoteRemarks: string | null;
        })[];
    }>;
}
