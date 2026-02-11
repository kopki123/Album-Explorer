import { ApiProperty } from '@nestjs/swagger';

export class HealthCheckDto {
  @ApiProperty({ example: 'ok' })
  status!: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  info!: Record<string, unknown>;

  @ApiProperty({ type: 'object', additionalProperties: true })
  error!: Record<string, unknown>;

  @ApiProperty({ type: 'object', additionalProperties: true })
  details!: Record<string, unknown>;
}
