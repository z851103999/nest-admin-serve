import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyReply } from 'fastify';
import { isDev } from 'src/config';
import { ApiException } from '../exceptions/api.exception';
import { ResOp } from '../class/res.class';
import { LoggerService } from 'src/shared/logger/logger.service';

/**
 * 异常接管，统一异常返回数据
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();

    // 检查API执行情况
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    // 写入JSON响应
    response.header('Content-Type', 'application/json; charset=utf-8');
    // 生产环境不会返回内部错误信息
    const code =
      exception instanceof ApiException
        ? (exception as ApiException).getStatus()
        : status;
    let message = '服务器异常，请稍后再试';
    // 开发模式下提示500类型错误，生产模式下屏蔽500内部错误提示
    if (isDev() || status < 500) {
      message =
        exception instanceof HttpException ? exception.message : `${exception}`;
    }
    // 记录 500 日志
    if (status >= 500) {
      this.logger.error(exception, ApiExceptionFilter.name);
    }
    const result = new ResOp(code, null, message);
    response.status(status).send(result);
  }
}
