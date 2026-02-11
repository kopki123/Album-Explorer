import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ApiMetaDto } from './api-meta.dto';

export class ApiResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 200 })
  code!: number;

  @ApiProperty({ example: 'OK' })
  message!: string;

  @ApiProperty({ nullable: true })
  data!: unknown;

  @ApiPropertyOptional({ type: () => ApiMetaDto })
  meta?: ApiMetaDto;
}
