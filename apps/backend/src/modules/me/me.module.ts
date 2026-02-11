import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AlbumEntity } from '../albums/entities/album.entity';
import { FavoriteEntity } from '../me/entities/favorite.entity';
import { RatingEntity } from '../me/entities/rating.entity';
import { UserEntity } from '../users/entities/user.entity';

import { MeService } from './me.service';
import { MeController } from './me.controller';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AlbumEntity, RatingEntity, FavoriteEntity])],
  controllers: [MeController],
  providers: [MeService],
})
export class MeModule {}
