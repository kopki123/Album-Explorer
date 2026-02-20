import crypto from 'crypto';
import type { ExecutionContext } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  override async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>() as any;
    const res = context.switchToHttp().getResponse<Response>();

    // 只有進入 /auth/google 時才產生 state 並寫入 cookie
    if (req.path === '/api/v1/auth/google') {
      const state = crypto.randomBytes(16).toString('hex');
      req._oauthState = state;

      res.cookie('oauth_state', state, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true',
        sameSite: (process.env.COOKIE_SAMESITE as any) ?? 'lax',
        domain: process.env.COOKIE_DOMAIN || undefined,
        path: '/api/v1/auth/google/callback',
        maxAge: 10 * 60 * 1000, // 10 分鐘
      });
    }

    return (await super.canActivate(context)) as boolean;
  }

  override getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>() as any;
    return {
      scope: ['profile', 'email'],
      state: req._oauthState, // 讓 google redirect 帶回 state
    };
  }
}
