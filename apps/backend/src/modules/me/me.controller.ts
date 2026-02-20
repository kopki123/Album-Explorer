import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { MeService } from './me.service';
import { CurrentUserId } from '../../common/decorators/current-user-id.decorator';
import { ApiMetaDto } from '../../common/dto/api-meta.dto';
import { ApiOkResponseEnvelope, ApiOkResponseEnvelopeWithMeta } from '../../common/swagger/api-response.decorator';
import {
  AddFavoriteBodyDto,
  addFavoriteBodySchema,
  DeleteResultDto,
  FavoriteListDataDto,
  FavoriteMutationResultDto,
  FavoriteStatusDto,
  listFavoriteQuerySchema,
  listRatingQuerySchema,
  MeDto,
  RatingListDataDto,
  RatingRecordDto,
  RatingStatusDto,
  UpsertRatingBodyDto,
  upsertRatingBodySchema,
} from './dto/me.dto';
import type {
  AddFavoriteBody,
  UpsertRatingBody,
  ListFavoriteQuery,
  ListRatingQuery,
} from './dto/me.dto';

@ApiTags('me')
@ApiBearerAuth('access_token')
@Controller('me')
@UseGuards(JwtAuthGuard)
export class MeController {
  constructor(private me: MeService) {}

  @Get()
  @ApiOkResponseEnvelope(MeDto)
  fetchMe(@CurrentUserId() userId: string) {
    return this.me.fetchMe(userId);
  }

  @Get('/favorites')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sort', required: false, enum: ['createdAt_desc', 'createdAt_asc'] })
  @ApiOkResponseEnvelopeWithMeta(FavoriteListDataDto, ApiMetaDto)
  listFavorite(
    @CurrentUserId() userId: string,
    @Query(new ZodValidationPipe(listFavoriteQuerySchema)) query: ListFavoriteQuery,
  ) {
    return this.me.listFavorites(userId, query);
  }

  @Get('/favorites/:albumId')
  @ApiParam({ name: 'albumId', type: Number })
  @ApiOkResponseEnvelope(FavoriteStatusDto)
  fetchFavorite(
    @CurrentUserId() userId: string,
    @Param('albumId', ParseIntPipe) albumId: number,
  ) {
    return this.me.fetchFavorite(userId, albumId);
  }

  @Post('/favorites')
  @ApiBody({ type: AddFavoriteBodyDto })
  @ApiOkResponseEnvelope(FavoriteMutationResultDto)
  addFavorite(
    @CurrentUserId() userId: string,
    @Body(new ZodValidationPipe(addFavoriteBodySchema)) body: AddFavoriteBody,
  ) {
    return this.me.addFavorite(userId, body.albumId);
  }

  @Delete('/favorites/:albumId')
  @ApiParam({ name: 'albumId', type: Number })
  @ApiOkResponseEnvelope(DeleteResultDto)
  removeFavorite(
    @CurrentUserId() userId: string,
    @Param('albumId', ParseIntPipe) albumId: number,
  ) {
    return this.me.removeFavorite(userId, albumId);
  }

  @Get('/ratings')
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'sort', required: false, enum: ['updatedAt_desc', 'createdAt_asc', 'score_desc', 'score_asc'] })
  @ApiOkResponseEnvelopeWithMeta(RatingListDataDto, ApiMetaDto)
  listRatings(
    @CurrentUserId() userId: string,
    @Query(new ZodValidationPipe(listRatingQuerySchema)) query: ListRatingQuery,
  ) {
    return this.me.listRatings(userId, query);
  }

  @Get('/ratings/:albumId')
  @ApiParam({ name: 'albumId', type: Number })
  @ApiOkResponseEnvelope(RatingStatusDto)
  fetchRating(
    @CurrentUserId() userId: string,
    @Param('albumId', ParseIntPipe) albumId: number,
  ) {
    return this.me.fetchRating(userId, albumId);
  }

  @Put('/ratings/:albumId')
  @ApiParam({ name: 'albumId', type: Number })
  @ApiBody({ type: UpsertRatingBodyDto })
  @ApiOkResponseEnvelope(RatingRecordDto)
  upsertRatings(
    @CurrentUserId() userId: string,
    @Param('albumId', ParseIntPipe) albumId: number,
    @Body(new ZodValidationPipe(upsertRatingBodySchema)) body: UpsertRatingBody,
  ) {
    return this.me.upsertRating(userId, albumId, body);
  }

  @Delete('/ratings/:albumId')
  @ApiParam({ name: 'albumId', type: Number })
  @ApiOkResponseEnvelope(DeleteResultDto)
  removeRatings(
    @CurrentUserId() userId: string,
    @Param('albumId', ParseIntPipe) albumId: number,
  ) {
    return this.me.deleteRating(userId, albumId);
  }
}
