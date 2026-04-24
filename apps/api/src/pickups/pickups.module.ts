import { Module } from '@nestjs/common';
import { PickupsService } from './pickups.service';
import { PickupsController } from './pickups.controller';

@Module({
  controllers: [PickupsController],
  providers: [PickupsService],
})
export class PickupsModule {}
