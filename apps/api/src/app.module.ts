import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { PrismaModule } from './prisma/prisma.module';
import { S3Module } from './s3/s3.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompaniesModule } from './companies/companies.module';
import { RequirementsModule } from './requirements/requirements.module';
import { AuditsModule } from './audits/audits.module';
import { AuctionsModule } from './auctions/auctions.module';
import { PaymentsModule } from './payments/payments.module';
import { PickupsModule } from './pickups/pickups.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // Enable cron scheduler for auction phase transitions
    ScheduleModule.forRoot(),

    // Core infrastructure (global)
    PrismaModule,
    S3Module,

    // Feature modules
    AuthModule,
    UsersModule,
    CompaniesModule,
    RequirementsModule,
    AuditsModule,
    AuctionsModule,
    PaymentsModule,
    PickupsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
