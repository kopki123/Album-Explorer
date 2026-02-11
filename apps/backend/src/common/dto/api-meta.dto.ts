import { ApiPropertyOptional } from '@nestjs/swagger';
import { ApiPaginationDto } from './api-pagination.dto';

export class ApiMetaDto {
  @ApiPropertyOptional({ type: () => ApiPaginationDto })
  pagination?: ApiPaginationDto;
}
