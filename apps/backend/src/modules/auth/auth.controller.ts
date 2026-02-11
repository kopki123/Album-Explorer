import { Body, Controller, ForbiddenException, Get, Post, Query, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { ApiBody, ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { CsrfGuard } from '../../common/guards/csrf.guard';
import type { GoogleProfileUser } from './strategies/google.strategy';
import { ZodValidationPipe } from '../../common/pipes/zod-vaildation.pipe';
import {
  clearRefreshCookie,
  getRefreshCookie,
  setRefreshCookie,
} from './auth.cookies';
import { ApiOkResponseEnvelope } from '../../common/swagger/api-response.decorator';
import { AuthTokensDto, FakeLoginBodyDto, OkResponseDto, fakeLoginBodySchema } from './dto/auth.dto';
import type { FakeLoginBody } from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService, private cfg: ConfigService) {}

  @Post('fake-login')
  @UsePipes(new ZodValidationPipe(fakeLoginBodySchema))
  @ApiBody({ type: FakeLoginBodyDto })
  @ApiOkResponseEnvelope(AuthTokensDto)
  async fakeLogin(
    @Body() body: FakeLoginBody,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (this.cfg.get('NODE_ENV') === 'production') {
      throw new ForbiddenException('fake-login is disabled in production');
    }
    const result = await this.auth.fakeLogin(body);
    setRefreshCookie(res, this.cfg, result.refreshToken);

    return { accessToken: result.accessToken, user: result.user };
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  google() {
    return;
  }

  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  async googleCallback(@Req() req: Request<any>, @Res() res: Response) {
    // 1) 驗證 state（防 login CSRF）
    const stateQuery = (req.query.state as string | undefined) ?? '';
    const stateCookie = (req as any).cookies?.oauth_state ?? '';

    // 清掉 state cookie（一次性）
    res.clearCookie('oauth_state', {
      httpOnly: true,
      secure: this.cfg.get('COOKIE_SECURE') === 'true',
      sameSite: (this.cfg.get('COOKIE_SAMESITE') as any) ?? 'lax',
      domain: this.cfg.get('COOKIE_DOMAIN') ?? undefined,
      path: '/api/v1/auth/google/callback',
    });

    if (!stateQuery || !stateCookie || stateQuery !== stateCookie) {
      return res.status(401).send('Invalid oauth state');
    }

    // 2) passport validate 後的 profile
    const profile = (req as any).user as GoogleProfileUser;

    // 3) 找/建 user + 發一組 tokens（rotation refresh）
    const result = await this.auth.loginWithGoogle(profile);

    // 4) refresh token 放 httpOnly cookie（前端永遠拿不到）
    setRefreshCookie(res, this.cfg, result.refreshToken);

    // 5) 不把 token 放 URL，直接導回前端
    const target = this.cfg.get<string>('WEB_LOGIN_SUCCESS_REDIRECT_URL') ?? 'http://localhost:4200/';
    return res.redirect(target);
  }

  @Post('refresh')
  @UseGuards(CsrfGuard)
  @ApiOkResponseEnvelope(AuthTokensDto)
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = getRefreshCookie(req);

    if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token' });

    const result = await this.auth.refresh(refreshToken);

    // rotation：更新 refresh cookie
    setRefreshCookie(res, this.cfg, result.refreshToken);

    // 回傳 access token + user（給前端存在記憶體）
    return res.json({ accessToken: result.accessToken, user: result.user });
  }

  @Post('logout')
  @UseGuards(CsrfGuard)
  @ApiOkResponseEnvelope(OkResponseDto)
  async logout(@Req() req: Request, @Res() res: Response) {
    const refreshToken = getRefreshCookie(req);

    if (refreshToken) await this.auth.logout(refreshToken);

    clearRefreshCookie(res, this.cfg);
    return res.json({ ok: true });
  }
}
