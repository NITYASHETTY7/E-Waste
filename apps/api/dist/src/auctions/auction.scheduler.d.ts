import { AuctionsService } from './auctions.service';
export declare class AuctionScheduler {
    private auctionsService;
    constructor(auctionsService: AuctionsService);
    handlePhaseTransitions(): Promise<void>;
}
