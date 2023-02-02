import { LoggerService } from '@/shared/logger/logger.service';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AjaxResult } from '../class/ajax-result.class';
import { ApiException } from '../exceptions/api.exception';

/**
 * 全局错误拦截器
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const { status, result } = this.errorResult(exception);
    response.header('Content-Type', 'application/json; charset=utf-8');
    response.status(status).json(result);
  }

  /* 解析错误类型，获取状态码和返回值 */
  errorResult(exception: unknown) {
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const code =
      exception instanceof ApiException
        ? (exception as ApiException).getErrCode()
        : status;

    let message: string;
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      message = (response as any).message ?? response;
    } else {
      message = `${exception}`;
    }
    // 记录 500 日志
    if (status >= 500) {
      this.logger.error(exception, AllExceptionsFilter.name);
    }
    // 401
    if (status >= 401) {
      this.logger.warn(exception, AllExceptionsFilter.name);
    }

    return {
      status,
      result: AjaxResult.error(message, code),
    };
  }
}
