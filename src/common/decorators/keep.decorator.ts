import { SetMetadata } from '@nestjs/common';
import { KEEP_KEY } from '../contants/decorator.contant';

/**
 * 保持原数据返回的装饰器
 * @returns
 */
export const Keep = () => SetMetadata(KEEP_KEY, true);
