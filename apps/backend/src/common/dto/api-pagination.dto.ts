import { ApiProperty } from '@nestjs/swagger';

export class ApiPaginationDto {
  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  pageSize!: number;

  @ApiProperty({ example: 101 })
  total!: number;
}
