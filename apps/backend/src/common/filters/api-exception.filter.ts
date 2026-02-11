import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const isHttp = exception instanceof HttpException;
    const status = isHttp ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = isHttp ? exception.getResponse() : null;

    // 你可以把 code/message 的來源規則固定下來
    const message =
      (typeof responseBody === 'object' && responseBody && (responseBody as any).message) ||
      (exception as any)?.message ||
      'Internal Server Error';

    // 如果你有自訂 HttpException payload（例如 { code, message }），這裡就能拿到
    const code =
      (typeof responseBody === 'object' && responseBody && (responseBody as any).code) ||
      status;

    res.status(status).json({
      success: false,
      code,
      message: Array.isArray(message) ? message.join(', ') : message,
      data: null,
      meta: {
        path: req.url,
      },
    });
  }
}
