import { ErrorCodeMap } from './../contants/error-code.contants';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ErrorCodeMapType } from '../contants/error-code.contants';

/**
 *  Api业务异常
 */
export class ApiException extends HttpException {
  /**
   * 业务错误代码 不是http code
   */
  private errorCode: ErrorCodeMapType;

  constructor(msg: ErrorCodeMapType, status?: HttpStatus) {
    // super(ErrorCodeMap[errorCode], status)
    // this.errorCode = errorCode;
    super(ErrorCodeMap[msg], status);
    this.errorCode = msg;
  }

  getErrorCode(): ErrorCodeMapType {
    return this.errorCode;
  }
}
