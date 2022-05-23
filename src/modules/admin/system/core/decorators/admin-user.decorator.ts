import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ADMIN_USER } from '../../../admin.constants';

export const AdminUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // auth guard 会挂载这个
    const user = request[ADMIN_USER];

    return data ? user?.[data] : user;
  },
);
