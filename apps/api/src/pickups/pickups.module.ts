import { Module } from '@nestjs/common';
import { PickupsService } from './pickups.service';
import { PickupsController } from './pickups.controller';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [DocumentsModule],
  controllers: [PickupsController],
  providers: [PickupsService],
})
export class PickupsModule {}
