import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionGateway } from './auction.gateway';
import { AuctionScheduler } from './auction.scheduler';

@Module({
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionGateway, AuctionScheduler],
  exports: [AuctionsService],
})
export class AuctionsModule {}
