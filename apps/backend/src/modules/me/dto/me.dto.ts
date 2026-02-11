import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';
import { AlbumPublicDto, AlbumSummaryDto } from '../../albums/dto/album.dto';

export const addFavoriteBodySchema = z.object({
  albumId: z.number().int().positive(),
});

export const listFavoriteQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['createdAt_desc', 'createdAt_asc']).optional(),
});

export const upsertRatingBodySchema = z.object({
  score: z.number().int().min(1).max(5),
  review: z.string().max(2000).optional().nullable(),
});

export const listRatingQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(10),
  sort: z.enum(['updatedAt_desc', 'createdAt_asc', 'score_desc', 'score_asc']).optional(),
});

export type AddFavoriteBody = z.infer<typeof addFavoriteBodySchema>;
export type ListFavoriteQuery = z.infer<typeof listFavoriteQuerySchema>;
export type UpsertRatingBody = z.infer<typeof upsertRatingBodySchema>;
export type ListRatingQuery = z.infer<typeof listRatingQuerySchema>;

export class MeDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiPropertyOptional({ example: 'dev@example.com', nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ example: 'Dev User', nullable: true })
  name!: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', nullable: true })
  avatarUrl!: string | null;
}

export class AddFavoriteBodyDto {
  @ApiProperty({ example: 1 })
  albumId!: number;
}

export class FavoriteMutationResultDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ example: true })
  created!: boolean;
}

export class DeleteResultDto {
  @ApiProperty({ example: true })
  ok!: boolean;

  @ApiProperty({ example: true })
  deleted!: boolean;
}

export class FavoriteListItemDto {
  @ApiProperty({ type: () => AlbumPublicDto })
  album!: AlbumPublicDto;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt!: Date;
}

export class FavoriteListDataDto {
  @ApiProperty({ type: () => [FavoriteListItemDto] })
  items!: FavoriteListItemDto[];
}

export class FavoriteStatusDto {
  @ApiProperty({ example: 1 })
  albumId!: number;

  @ApiProperty({ example: true })
  isFavorited!: boolean;

  @ApiPropertyOptional({ example: '2025-01-01T00:00:00.000Z', nullable: true })
  favoritedAt!: Date | null;

  @ApiPropertyOptional({ type: () => AlbumSummaryDto, nullable: true })
  album!: AlbumSummaryDto | null;
}

export class UpsertRatingBodyDto {
  @ApiProperty({ example: 3, minimum: 1, maximum: 5 })
  score!: number;

  @ApiPropertyOptional({ example: 'Great album.', nullable: true, maxLength: 2000 })
  review?: string | null;
}

export class RatingRecordDto {
  @ApiProperty({ example: 1 })
  albumId!: number;

  @ApiProperty({ example: 3 })
  score!: number;

  @ApiPropertyOptional({ example: 'Great album.', nullable: true })
  review!: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-02T00:00:00.000Z' })
  updatedAt!: Date;
}

export class RatingListItemDto {
  @ApiProperty({ type: () => AlbumPublicDto })
  album!: AlbumPublicDto;

  @ApiProperty({ example: 3 })
  score!: number;

  @ApiPropertyOptional({ example: 'Great album.', nullable: true })
  review!: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-02T00:00:00.000Z' })
  updatedAt!: Date;
}

export class RatingListDataDto {
  @ApiProperty({ type: () => [RatingListItemDto] })
  items!: RatingListItemDto[];
}

export class RatingDto {
  @ApiProperty({ example: 3 })
  score!: number;

  @ApiPropertyOptional({ example: 'Great album.', nullable: true })
  review!: string | null;

  @ApiProperty({ example: '2025-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-02T00:00:00.000Z' })
  updatedAt!: Date;
}

export class RatingStatusDto {
  @ApiProperty({ example: 1 })
  albumId!: number;

  @ApiProperty({ example: true })
  isRated!: boolean;

  @ApiPropertyOptional({ type: () => RatingDto, nullable: true })
  rating!: RatingDto | null;

  @ApiPropertyOptional({ type: () => AlbumSummaryDto, nullable: true })
  album!: AlbumSummaryDto | null;
}
