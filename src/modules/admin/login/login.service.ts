import { ApiException } from 'src/common/exceptions/api.exception';
import { SysLogService } from '../system/log/log.service';
import { SysUserService } from '../system/user/user.service';
import { UtilService } from '@/shared/services/utils.service';
import { Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { isEmpty } from 'lodash';
import { ImageCaptcha } from './login.class';
import { ImageCaptchaDto } from './login.dto';
import { JwtService } from '@nestjs/jwt';
import { SysMenuService } from '../system/menu/menu.service';
import { RedisService } from '@/shared/services/redis.service';

@Injectable()
export class LoginService {
  constructor(
    private util: UtilService,
    private menuService: SysMenuService,
    private userService: SysUserService,
    private logService: SysLogService,
    private jwtService: JwtService,
    private redisService: RedisService,
  ) {}

  /**
   * 创建验证码并加入Redis缓存中
   * @param captcha
   * @returns
   */
  async createImageCaptcha(captcha: ImageCaptchaDto): Promise<ImageCaptcha> {
    const svgConfig = {
      size: 4,
      color: true,
      noise: 4,
      width: isEmpty(captcha.width) ? 100 : captcha.width,
      height: isEmpty(captcha.height) ? 50 : captcha.height,
      charPreset: '1234567890',
    };
    const svg = svgCaptcha.create(svgConfig);
    const result = {
      img: `data:image/svg+xml;base64,${Buffer.from(svg.data).toString(
        'base64',
      )}`,
      id: this.util.generateUUID(),
    };
    // 5分钟过期时间
    await this.redisService
      .getRedis()
      .set(`admin:captcha:img:${result.id}`, svg.text, 'EX', 60 * 5);
    return result;
  }

  /**
   * 校验验证码
   * @param id
   * @param code
   */
  async checkImgCaptcha(id: string, code: string): Promise<void> {
    const result: string = await this.redisService
      .getRedis()
      .get(`admin:captcha:img:${id}`);
    if (isEmpty(result) || code.toLowerCase() !== result.toLowerCase()) {
      throw new ApiException(10002);
    }
    await this.redisService.getRedis().del(`admin:captcha:img:${id}`);
  }

  /**
   * 获取登录JWT
   * @param username
   * @param password
   * @param ip
   * @param ua
   * @returns
   */
  async getLoginSign(
    username: string,
    password: string,
    ip: string,
    ua: string,
  ): Promise<any> {
    const user = await this.userService.findUserByUserName(username);
    // 用户不存在
    if (isEmpty(user)) {
      throw new ApiException(10003);
    }
    // 密码加盐
    const comparePassword = this.util.md5(`${password}${user.psalt}`);
    // 密码校验错误
    if (user.password !== comparePassword) {
      throw new ApiException(10003);
    }
    const perms = await this.menuService.getPerms(user.id);
    // 系统管理员开放多点登录
    if (user.id === 1) {
      const oldToken = await this.getRedisTokenById(user.id);
      if (oldToken) {
        return oldToken;
      }
    }
    const accessToken = this.jwtService.sign(
      {
        uid: parseInt(user.id.toString()),
        pv: 1,
      },
      {
        expiresIn: '24h',
      },
    );

    const refreshToken = this.jwtService.sign(
      {
        uid: parseInt(user.id.toString()),
        pv: 1,
      },
      {
        expiresIn: '7d',
      },
    );

    await this.redisService
      .getRedis()
      .set(`admin:passwordVersion:${user.id}`, 1);
    // Token设置过期时间 24小时
    await this.redisService
      .getRedis()
      .set(`admin:accessToken:${user.id}`, accessToken, 'EX', 60 * 60 * 24);
    await this.redisService
      .getRedis()
      .set(
        `admin:refreshToken:${user.id}`,
        refreshToken,
        'EX',
        60 * 60 * 24 * 7,
      );
    await this.redisService
      .getRedis()
      .set(`admin:perms:${user.id}`, JSON.stringify(perms));
    await this.logService.saveLoginLog(user.id, ip, ua);
    // 过期时间
    const expiration = await this.redisService
      .getRedis()
      .ttl(`admin:accessToken${user.id}`);
    return { accessToken, refreshToken, expiration };
  }

  async refreshToken(refreshToken: string): Promise<object> {
    if (isEmpty(refreshToken)) {
      throw new ApiException(11001);
    }
    const decodeRefreshToken = await this.jwtService.verify(refreshToken);
    const { uid, pv } = decodeRefreshToken;
    const redisToken = await this.redisService.getRedis().get(uid);
    if (refreshToken !== redisToken) {
      throw new ApiException(10003);
    }
    const newAccessToken = this.jwtService.sign(
      {
        uid,
        pv,
      },
      {
        expiresIn: '24h',
      },
    );
    const newRefreshToken = this.jwtService.sign(
      {
        uid,
        pv,
      },
      {
        expiresIn: '7d',
      },
    );
    await this.redisService
      .getRedis()
      .set(`admin:accessToken:${uid}`, newAccessToken, 'EX', 60 * 60 * 24);
    await this.redisService
      .getRedis()
      .set(
        `admin:refreshToken:${uid}`,
        newRefreshToken,
        'EX',
        60 * 60 * 24 * 7,
      );
    return {
      newRefreshToken,
      newAccessToken,
    };
  }

  /**
   * 清楚登录状态信息
   * @param uid
   */
  async clearLoginStatus(uid: number): Promise<void> {
    await this.userService.forbidden(uid);
  }

  /**
   * 获取权限菜单
   */
  async getPermMenu(uid: number): Promise<any> {
    const menus = await this.menuService.getMenus(uid);
    const perms = await this.menuService.getPerms(uid);
    return { menus, perms };
  }

  async getRedisPasswordVersionById(id: number): Promise<string> {
    return this.redisService.getRedis().get(`admin:passwordVersion:${id}`);
  }

  /**
   * 通过 Id 获取 Redis 令牌
   * @param id
   */
  async getRedisTokenById(id: number): Promise<any> {
    const accessToken = this.redisService
      .getRedis()
      .get(`admin:accessToken:${id}`);
    const refreshToken = this.redisService
      .getRedis()
      .get(`admin:refreshToken${id}`);
    return { accessToken, refreshToken };
  }

  /**
   * 按 ID 获取 Redis Perms
   * @param id
   */
  async getRedisPermsById(id: number): Promise<string> {
    return this.redisService.getRedis().get(`admin:perms:${id}`);
  }
}
