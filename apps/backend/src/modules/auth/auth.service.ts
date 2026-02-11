import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import crypto from 'crypto';
import { ConfigService } from '@nestjs/config';

import { UserEntity } from '../users/entities/user.entity';
import { RefreshSessionEntity } from './entities/refresh-session.entity';
import type { GoogleProfileUser } from './strategies/google.strategy';
import { OAuthAccountEntity, OAuthProvider } from './entities/oauth-account.entity';

type RefreshPayload = { sub: string; jti: string; exp: number };

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private cfg: ConfigService,
    @InjectRepository(UserEntity) private users: Repository<UserEntity>,
    @InjectRepository(RefreshSessionEntity) private sessions: Repository<RefreshSessionEntity>,
    @InjectRepository(OAuthAccountEntity) private oauthAccounts: Repository<OAuthAccountEntity>,
  ) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private async signAccessToken(userId: string) {
    return this.jwt.signAsync({ sub: userId }); // 用 JwtModule 預設 secret/exp
  }

  private async signRefreshToken(userId: string, jti: string) {
    const secret = this.cfg.get<string>('JWT_REFRESH_SECRET');
    const expiresIn = '30d';

    return this.jwt.signAsync(
      { sub: userId, jti },
      { secret, expiresIn },
    );
  }

  private async issueTokens(user: UserEntity) {
    const jti = crypto.randomUUID();

    const refreshToken = await this.signRefreshToken(user.id, jti);
    const decoded = this.jwt.decode(refreshToken) as RefreshPayload | null;
    if (!decoded?.exp) throw new UnauthorizedException('Invalid refresh token');

    const session = this.sessions.create({
      id: jti,
      user,
      tokenHash: this.hashToken(refreshToken),
      expiresAt: new Date(decoded.exp * 1000),
      revokedAt: null,
    });
    await this.sessions.save(session);

    const accessToken = await this.signAccessToken(user.id);

    return {
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, displayName: user.name, avatarUrl: user.avatarUrl },
    };
  }

  // ---------- fake login ----------
  async fakeLogin(dto: { email?: string; displayName?: string }) {
    const email = dto.email ?? 'dev@example.com';
    let user = await this.users.findOne({ where: { email } });

    if (!user) {
      user = this.users.create({
        email,
        name: dto.displayName ?? 'Dev User',
      });
      user = await this.users.save(user);
    }

    return this.issueTokens(user);
  }

  // ---------- google login ----------
  async loginWithGoogle(p: GoogleProfileUser) {
    const provider: OAuthProvider = 'google';

    // 1) 先用 provider + providerUserId 找 oauth account
    const existingAccount = await this.oauthAccounts.findOne({
      where: { provider, providerUserId: p.googleId },
      relations: { user: true },
    });

    if (existingAccount) {
      // 可選：同步 user 基本資料
      const user = existingAccount.user;
      user.name = p.displayName ?? user.name;
      user.avatarUrl = p.avatarUrl ?? user.avatarUrl;
      user.email = p.email ?? user.email;
      await this.users.save(user);

      return this.issueTokens(user);
    }

    // 2) 找不到 account → 走 account linking（用 email 綁舊 user）
    let user: UserEntity | null = null;

    if (p.email) {
      user = await this.users.findOne({ where: { email: p.email } });
    }

    // 3) 沒有 user 就新建一個
    if (!user) {
      user = this.users.create({
        email: p.email,
        name: p.displayName,
        avatarUrl: p.avatarUrl,
      });
      user = await this.users.save(user);
    } else {
      // 可選：同步資料
      user.name = p.displayName ?? user.name;
      user.avatarUrl = p.avatarUrl ?? user.avatarUrl;
      user.email = p.email ?? user.email;
      user = await this.users.save(user);
    }

    // 4) 建立 oauth account（unique：provider+providerUserId）
    const account = this.oauthAccounts.create({
      user,
      provider,
      providerUserId: p.googleId,
    });
    await this.oauthAccounts.save(account);

    return this.issueTokens(user);
  }

  // ---------- refresh (rotation) ----------
  async refresh(refreshToken: string) {
    const secret = this.cfg.get<string>('JWT_REFRESH_SECRET');
    if (!secret) throw new UnauthorizedException('Missing refresh secret');

    let payload: RefreshPayload;
    try {
      payload = await this.jwt.verifyAsync(refreshToken, { secret });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const session = await this.sessions.findOne({
      where: { id: payload.jti },
      relations: { user: true },
    });

    if (!session) throw new UnauthorizedException('Refresh session not found');
    if (session.revokedAt) throw new UnauthorizedException('Refresh token revoked');
    if (session.expiresAt.getTime() < Date.now()) throw new UnauthorizedException('Refresh token expired');

    // 防止被偷換：同一 jti 的 token 必須 hash 一致
    if (session.tokenHash !== this.hashToken(refreshToken)) {
      // 安全策略：直接撤銷該 session（可選）
      session.revokedAt = new Date();
      await this.sessions.save(session);
      throw new UnauthorizedException('Refresh token mismatch');
    }

    // rotation：撤銷舊 session，發新一組
    session.revokedAt = new Date();
    await this.sessions.save(session);

    return this.issueTokens(session.user);
  }

  // ---------- logout ----------
  async logout(refreshToken: string) {
    const secret = this.cfg.get<string>('JWT_REFRESH_SECRET');
    if (!secret) return { ok: true };

    try {
      const payload = await this.jwt.verifyAsync<RefreshPayload>(refreshToken, { secret });
      const session = await this.sessions.findOne({ where: { id: payload.jti } });
      if (session && !session.revokedAt) {
        session.revokedAt = new Date();
        await this.sessions.save(session);
      }
    } catch {
      // token 不合法就視為已登出
    }

    return { ok: true };
  }
}
