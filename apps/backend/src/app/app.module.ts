import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';

import { HealthModule } from '../health/health.module';
import { AlbumsModule } from '../modules/albums/albums.module';
import { AuthModule } from '../modules/auth/auth.module';
import { MeModule } from '../modules/me/me.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
    }),

    ConfigModule.forRoot({ isGlobal: true }),

    TerminusModule,

    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 30,
        },
      ],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => {
        const isProd = cfg.get('NODE_ENV') === 'production';
        const url = cfg.get<string>('DATABASE_URL');

        if (!url) throw new Error('Missing DATABASE_URL');

        const parseBoolean = (value: string | undefined) => value === undefined ? undefined : value === 'true';

        const sslEnabled = parseBoolean(cfg.get<string>('DB_SSL')) ?? isProd;
        const sslRejectUnauthorized = parseBoolean(cfg.get<string>('DB_SSL_REJECT_UNAUTHORIZED')) ?? isProd;

        return {
          type: 'postgres',
          url,
          ssl: sslEnabled ? { rejectUnauthorized: sslRejectUnauthorized } : false,
          autoLoadEntities: true,
          synchronize: !isProd,
          logging: !isProd,
          extra: { max: Number(cfg.get('DB_POOL_MAX') ?? 5) },
        };
      },
    }),

    HealthModule,

    AuthModule,
    AlbumsModule,
    MeModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
