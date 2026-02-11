import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((original) => {
        const data = original?.data ?? original ?? null;
        const meta = original?.meta;
        const message = original?.message ?? 'OK';
        const code = original?.code ?? 200;

        return {
          success: true,
          code,
          message,
          data,
          meta,
        };
      }),
    );
  }
}

