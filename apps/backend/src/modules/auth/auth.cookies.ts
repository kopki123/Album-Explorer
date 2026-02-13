import type { Response } from 'express';
import type { CookieOptions } from 'express';
import { ConfigService } from '@nestjs/config';

const REFRESH_COOKIE_NAME = 'refresh_token';

function cookieOptions(cfg: ConfigService): CookieOptions {
  const secure = cfg.get<string>('COOKIE_SECURE') === 'true';
  const sameSite = (cfg.get<string>('COOKIE_SAMESITE') ?? 'lax') as 'lax' | 'strict' | 'none';
  const domain = undefined;

  return {
    httpOnly: true,
    secure,
    sameSite,
    domain,
    path: '/api/v1/auth', // refresh/logout 都能用
  };
}

export function setRefreshCookie(res: Response, cfg: ConfigService, refreshToken: string) {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...cookieOptions(cfg),
    // 讓 cookie 期限跟 refresh token 一樣久
    maxAge: 1000 * 60 * 60 * 24 * 30, // 30d
  });
}
export function clearRefreshCookie(res: Response, cfg: ConfigService) {
  res.clearCookie(REFRESH_COOKIE_NAME, cookieOptions(cfg));
}

export function getRefreshCookie(req: any): string | null {
  return req.cookies?.[REFRESH_COOKIE_NAME] ?? null;
}