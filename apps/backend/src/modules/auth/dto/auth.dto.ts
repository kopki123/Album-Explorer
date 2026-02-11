import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from 'zod';

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const fakeLoginBodySchema = z.object({
  email: z.string().email().optional(),
  displayName: z.string().min(1).optional(),
});

export type RefreshBody = z.infer<typeof refreshBodySchema>;
export type FakeLoginBody = z.infer<typeof fakeLoginBodySchema>;

export class AuthUserDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id!: string;

  @ApiPropertyOptional({ example: 'dev@example.com', nullable: true })
  email!: string | null;

  @ApiPropertyOptional({ example: 'Dev User', nullable: true })
  displayName!: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png', nullable: true })
  avatarUrl!: string | null;
}

export class AuthTokensDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken!: string;

  @ApiProperty({ type: () => AuthUserDto })
  user!: AuthUserDto;
}

export class FakeLoginBodyDto {
  @ApiPropertyOptional({ example: 'dev@example.com' })
  email?: string;

  @ApiPropertyOptional({ example: 'Dev User' })
  displayName?: string;
}

export class OkResponseDto {
  @ApiProperty({ example: true })
  ok!: boolean;
}
