import { HttpException } from '@nestjs/common';
import { ErrorCodeMap } from '../contents/error-code.contants';

/**
 * APi业务列席错误代码，非HTTP CODE
 */
export class ApiException extends HttpException {
  private errorCode: number;

  constructor(errorCode: number) {
    super(ErrorCodeMap[errorCode], 200);
    this.errorCode = errorCode;
  }

  /**
   * 获取错误代码
   */
  getErrorCode(): number {
    return this.errorCode;
  }
}
