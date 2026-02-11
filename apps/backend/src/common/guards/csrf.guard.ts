import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(private cfg: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();

    const originHeader = Array.isArray(req.headers.origin) ? req.headers.origin[0] : req.headers.origin;
    const refererHeader = Array.isArray(req.headers.referer) ? req.headers.referer[0] : req.headers.referer;

    const allowNoOrigin =
      this.cfg.get('CSRF_ALLOW_NO_ORIGIN') === 'true' || this.cfg.get('NODE_ENV') !== 'production';

    if (!originHeader && !refererHeader) {
      if (allowNoOrigin) return true;

      throw new ForbiddenException('Missing origin');
    }

    const allowedOrigins = this.getAllowedOrigins();
    if (allowedOrigins.has('*')) return true;

    const candidates: string[] = [];
    if (originHeader && originHeader !== 'null') candidates.push(originHeader);
    if (refererHeader) candidates.push(refererHeader);

    for (const candidate of candidates) {
      const origin = this.toOrigin(candidate);
      if (origin && allowedOrigins.has(origin)) {
        return true;
      }
    }

    throw new ForbiddenException('Invalid origin');
  }

  private getAllowedOrigins(): Set<string> {
    const raw = this.cfg.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:4200';
    const parts = raw
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const allowed = new Set<string>();
    for (const entry of parts.length ? parts : ['http://localhost:4200']) {
      if (entry === '*') {
        allowed.add('*');
        continue;
      }
      allowed.add(this.toOrigin(entry) ?? entry);
    }

    return allowed;
  }

  private toOrigin(value: string): string | null {
    try {
      return new URL(value).origin;
    } catch {
      return null;
    }
  }
}
