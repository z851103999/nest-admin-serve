import { SetMetadata } from '@nestjs/common';
import { REOEATSUBMIT_METADATA } from '../contants/decorator.contant';

export class RepeatSubmitOption {
  interval?: number = 5; //默认5s
  message?: string = '请求过于频繁';
}
/**
 * 防止重复提交装饰器
 * @param option 重复提交选项
 * @returns
 */
export const RepeatSubmit = (option?: RepeatSubmitOption) => {
  const repeatSubmitOption = Object.assign(new RepeatSubmitOption(), option);
  return SetMetadata(REOEATSUBMIT_METADATA, repeatSubmitOption);
};
