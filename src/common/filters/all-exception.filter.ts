import { ApiException } from 'src/common/exceptions/api.exception';
import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { LoggerService } from '@/shared/logger/logger.service';
import { ResponseDto } from '../class/res.class';
import { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  constructor(private logger: LoggerService) {}

  catch(exception: any, host?: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    // 检查API执行情况
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR; // 500
    // 设置 json 响应
    response.header('Content-Type', 'application/json;charset=utf-8');
    const code =
      exception instanceof ApiException
        ? (exception as ApiException).getErrorCode()
        : status;
    let message = '服务器异常，请稍后再试';
    message =
      exception instanceof HttpException ? exception.message : `${exception}`;
    // 记录 500 日志
    if (status >= 500) {
      this.logger.error(exception, ApiExceptionFilter.name);
    }
    const result = new ResponseDto(code, null, message);
    response.status(status).send(result);
    return {
      result,
      status,
    };
  }
}
