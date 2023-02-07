/**
 * @description 返回值封装对象
 */
export class AjaxResult {
  readonly code: number;
  readonly msg: string;
  [key: string]: any;

  constructor(code: number, msg: string, data: any) {
    this.code = code;
    this.msg = msg;
    this.data = data;
  }

  static success(data?: any, msg?: string) {
    return new AjaxResult(200, msg, data);
  }

  static error(code: number, msg?: string, data?: any) {
    return new AjaxResult(code || 500, msg || 'error', data);
  }
}
