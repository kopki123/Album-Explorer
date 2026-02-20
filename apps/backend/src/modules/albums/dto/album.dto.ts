import { ApiProperty } from '@nestjs/swagger';

export class GenreDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'Rock' })
  name!: string;

  @ApiProperty({ example: 'rock' })
  slug!: string;
}

export class TrackDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 1 })
  trackNo!: number;

  @ApiProperty({ example: 'Speak to Me' })
  title!: string;

  @ApiProperty({ example: 90000, nullable: true })
  durationMs!: number | null;
}

export class AlbumPublicDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'the-dark-side-of-the-moon' })
  slug!: string;

  @ApiProperty({ example: 'The Dark Side of the Moon' })
  title!: string;

  @ApiProperty({ example: 'Pink Floyd' })
  artistName!: string;

  @ApiProperty({ example: '1973-03-01', format: 'date' })
  releaseDate!: string;

  @ApiProperty({ example: 'A seminal progressive rock album.', nullable: true })
  description!: string | null;

  @ApiProperty({ example: 2580000, nullable: true })
  durationMs!: number | null;

  @ApiProperty({ example: 'https://example.com/cover.jpg', nullable: true })
  coverUrl!: string | null;

  @ApiProperty({ example: 'https://en.wikipedia.org/wiki/The_Dark_Side_of_the_Moon', nullable: true })
  wikiUrl!: string | null;

  @ApiProperty({ example: '4LH4d3cOWNNsVw41Gqt2kv', nullable: true })
  spotifyId!: string | null;
}

export class AlbumDetailDto extends AlbumPublicDto {
  @ApiProperty({ type: () => [GenreDto] })
  genres!: GenreDto[];

  @ApiProperty({ type: () => [TrackDto] })
  tracks!: TrackDto[];
}

export class AlbumSummaryDto {
  @ApiProperty({ example: 1 })
  id!: number;

  @ApiProperty({ example: 'the-dark-side-of-the-moon' })
  slug!: string;

  @ApiProperty({ example: 'The Dark Side of the Moon' })
  title!: string;

  @ApiProperty({ example: 'Pink Floyd' })
  artistName!: string;

  @ApiProperty({ example: 'https://example.com/cover.jpg', nullable: true })
  coverUrl!: string | null;
}

export class AlbumListDataDto {
  @ApiProperty({ type: () => [AlbumDetailDto] })
  items!: AlbumDetailDto[];
}
