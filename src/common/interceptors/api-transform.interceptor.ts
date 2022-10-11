import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { FastifyReply } from 'fastify';
import { map } from 'rxjs/operators';
import { ResOp } from '../class/res.class';
import { TRANSFORM_KEEP_KEY_METADATA } from '../contants/decorator.contants';

/**
 * 统一处理返回接口结果，如果不需要则添加@keep装饰器
 */
export class ApiTransformInterceptor implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}
  // 实现自定义拦截器
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        const keep = this.reflector.get<boolean>(
          TRANSFORM_KEEP_KEY_METADATA,
          context.getHandler(),
        );
        if (keep) {
          return data;
        } else {
          //  FastifyReply http.ServerResponse
          const response = context.switchToHttp().getResponse<FastifyReply>();
          response.header('Content-Type', 'application/json;charset=utf-8');
          return new ResOp(200, data);
        }
      }),
    );
  }
}
