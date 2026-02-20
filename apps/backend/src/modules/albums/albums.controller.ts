import { Controller, Get, Param, ParseIntPipe, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { AlbumsService } from './albums.service';
import { ApiMetaDto } from '../../common/dto/api-meta.dto';
import { ApiOkResponseEnvelope, ApiOkResponseEnvelopeWithMeta } from '../../common/swagger/api-response.decorator';
import { AlbumDetailDto, AlbumListDataDto, AlbumPublicDto } from './dto/album.dto';
import { listAlbumsQuery } from './dto/album-query.dto';
import type { ListAlbumsQuery } from './dto/album-query.dto';

@ApiTags('albums')
@Controller('albums')
export class AlbumsController {
  constructor(private albums: AlbumsService) {}

  @Get()
  @UseInterceptors(CacheInterceptor)
  @ApiQuery({ name: 'q', required: false, type: String })
  @ApiQuery({
    name: 'sort',
    required: false,
    enum: ['releaseDate_desc', 'releaseDate_asc', 'title_asc'],
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiOkResponseEnvelopeWithMeta(AlbumListDataDto, ApiMetaDto)
  list(@Query(new ZodValidationPipe(listAlbumsQuery)) query: ListAlbumsQuery) {
    return this.albums.list({
      q: query.q,
      sort: query.sort,
      page: query.page,
      pageSize: query.pageSize,
    });
  }

  @Get('random')
  @ApiOkResponseEnvelope(AlbumPublicDto)
  random() {
    return this.albums.randomOne();
  }

  @Get('by-id/:id')
  @ApiParam({ name: 'id', type: Number })
  @ApiOkResponseEnvelope(AlbumPublicDto)
  detailById(@Param('id', ParseIntPipe) id: number) {
    return this.albums.detailById(id);
  }

  @Get(':slug')
  @UseInterceptors(CacheInterceptor)
  @ApiParam({ name: 'slug', type: String })
  @ApiOkResponseEnvelope(AlbumDetailDto)
  detailBySlug(@Param('slug') slug: string) {
    return this.albums.detailBySlug(slug);
  }
}
