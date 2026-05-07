import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      },
      log: ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();

    // Keepalive ping every 4 minutes to prevent RDS idle timeout
    setInterval(
      async () => {
        try {
          await this.$queryRaw`SELECT 1`;
        } catch (e) {
          // silently ignore
        }
      },
      4 * 60 * 1000,
    );
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
