import { Module } from '@nestjs/common';
import { AuctionsService } from './auctions.service';
import { AuctionsController } from './auctions.controller';
import { AuctionGateway } from './auction.gateway';
import { AuctionScheduler } from './auction.scheduler';
import { NotificationModule } from '../notifications/notification.module';

@Module({
  imports: [NotificationModule],
  controllers: [AuctionsController],
  providers: [AuctionsService, AuctionGateway, AuctionScheduler],
  exports: [AuctionsService],
})
export class AuctionsModule {}
