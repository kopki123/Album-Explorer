import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../users/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { CsrfGuard } from '../../common/guards/csrf.guard';
import { RefreshSessionEntity } from './entities/refresh-session.entity';
import { OAuthAccountEntity } from './entities/oauth-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, RefreshSessionEntity, OAuthAccountEntity]),
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: cfg.get('JWT_ACCESS_EXPIRES_IN') ?? '7d' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy, GoogleAuthGuard, CsrfGuard],
  exports: [JwtModule],
})
export class AuthModule {}
