import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AlbumsController } from './albums.controller';
import { AlbumEntity } from './entities/album.entity';
import { GenreEntity } from './entities/genre.entity';
import { TrackEntity } from './entities/track.entity';
import { AlbumsService } from './albums.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AlbumEntity, GenreEntity, TrackEntity]),
  ],
  controllers: [AlbumsController],
  providers: [AlbumsService],
})
export class AlbumsModule {}
