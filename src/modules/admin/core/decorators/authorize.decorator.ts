import { SetMetadata } from '@nestjs/common';
import { AUTHORIZE_KEY_METADATA } from 'src/modules/admin/admin.constants';

/**
 * 开放授权API，使用该注解则无需校验TOKEN和权限
 * @constructor
 * SetMetadata 使用指定key将元数据分配给类/函数的装饰器
 */
export const Authorize = () => SetMetadata(AUTHORIZE_KEY_METADATA, true);
