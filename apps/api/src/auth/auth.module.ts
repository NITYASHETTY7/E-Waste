import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({
      privateKey: process.env.JWT_PRIVATE_KEY
        ? process.env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n')
        : 'super-secret',
      publicKey: process.env.JWT_PUBLIC_KEY
        ? process.env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n')
        : undefined,
      signOptions: {
        expiresIn: '24h',
        algorithm: 'RS256',
      },
    }),
  ],
  providers: [AuthService, JwtStrategy, OtpService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
