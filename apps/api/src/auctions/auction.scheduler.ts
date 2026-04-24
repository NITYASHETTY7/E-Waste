import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuctionsService } from './auctions.service';

@Injectable()
export class AuctionScheduler {
  constructor(private auctionsService: AuctionsService) {}

  // Runs every minute to transition auction phases automatically
  @Cron(CronExpression.EVERY_MINUTE)
  async handlePhaseTransitions() {
    await this.auctionsService.transitionPhases();
  }
}
