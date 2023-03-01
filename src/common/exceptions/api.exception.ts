import { ErrorCodeMap } from './../contants/error-code.contants';
import { HttpException } from '@nestjs/common';
import { ErrorCodeMapType } from '../contants/error-code.contants';

/**
 *  Api业务异常
 */
export class ApiException extends HttpException {
  /**
   * 业务错误代码 不是http code
   */
  private errorCode: ErrorCodeMapType;

  constructor(errorCode: ErrorCodeMapType) {
    super(ErrorCodeMap[errorCode], 200);
    this.errorCode = errorCode;
  }

  getErrorCode(): ErrorCodeMapType {
    return this.errorCode;
  }
}
