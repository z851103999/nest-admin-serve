import { UtilService } from './../../../shared/services/utils.service';
import { Injectable } from '@nestjs/common';
import svgCaptcha from 'svg-captcha';
import { isEmpty } from 'lodash';
import { ImageCaptcha } from './login.class';
import { ImageCaptchaDto } from './login.dto';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../../../shared/services/redis.service';

@Injectable()
export class LoginService {
  constructor(private util: UtilService, private redisService: RedisService) {}
  async createImageCapcha(captcha: ImageCaptchaDto): Promise<ImageCaptcha> {
    const svg = svgCaptcha.create({
      size: 4,
      color: true,
      noise: 4,
      width: isEmpty(captcha.width) ? 100 : captcha.width,
      height: isEmpty(captcha.height) ? 50 : captcha.height,
      charPreset: '1234567890',
    });
    const result = {
      img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString(
        'base64',
      )}`,
      id: this.util.generateUUID(),
    };
    return result;
  }

  /**
   * 通过 Id 获取 Redis 密码版本
   * @param id
   */
  async getRedisPasswordVersionById(id: number): Promise<string> {
    return this.redisService.getRedis().get(`admin:passwordVersion:${id}`);
  }

  /**
   * 通过 Id 获取 Redis 令牌
   * @param id
   */
  async getRedisTokenById(id: number): Promise<string> {
    return this.redisService.getRedis().get(`admin:token:${id}`);
  }

  /**
   * 按 ID 获取 Redis Perms
   * @param id
   */
  async getRedisPermsById(id: number): Promise<string> {
    return this.redisService.getRedis().get(`admin:perms:${id}`);
  }
}
