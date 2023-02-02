import { createParamDecorator, ExecutionContext } from '@nestjs/common';
/**
 * @description sql数据范围
 */
export const DataScopeSql = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.dataScope;
  },
);
