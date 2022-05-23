import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as CryptoJS from 'crypto-js';
import { customAlphabet, nanoid } from 'nanoid';

@Injectable()
export class UtilService {
  /**
   * 获取请求IP
   * @param req
   */
  getReqIP(req: Request): string {
    return (
      // 判断是否有反向代理 IP
      (
        (req.headers['x-forwarded-for'] as string) ||
        // 判断后端的 socket 的 IP
        req.socket.remoteAddress
      ).replace('::ffff:', '')
    );
  }

  /**
   * AES加密
   * @param msg
   * @param secret
   */
  public aesEnctypt(msg: string, secret: string): string {
    return CryptoJS.AES.encrypt(msg, secret).toString();
  }

  /**
   * AES解密
   * @param encrypted
   * @param secret
   */
  public aesDecrypt(encrypted: string, secret: string): string {
    return CryptoJS.AES.decrypt(encrypted, secret).toString(CryptoJS.enc.Utf8);
  }

  /**
   * 生成一个uuid  https://github.com/ai/nanoid/blob/HEAD/README.zh-CN.md
   */
  public generateUUID(): string {
    return nanoid();
  }

  /**
   * md5加密
   * @param msg
   * @returns
   */
  public md5(msg: string): string {
    return CryptoJS.MD5(msg).toString();
  }

  /**
   * 生成一个随机的值
   * @param length
   * @param placeholder
   * @returns
   */
  public generateRandomValue(
    length: number,
    placeholder = '1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM',
  ): string {
    // 生成安全唯一的ID与自定义字母表
    const customNanoid = customAlphabet(placeholder, length);
    return customNanoid();
  }
}
