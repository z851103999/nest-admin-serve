import { ApiException } from 'src/common/exceptions/api.exception';
import { SysLogService } from '../system/log/log.service';
import { SysUserService } from '../system/user/user.service';
import { UtilService } from '../../../shared/services/utils.service';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import * as svgCaptcha from 'svg-captcha';
import { isEmpty } from 'lodash';
import { ImageCaptcha } from './login.class';
import { ImageCaptchaDto } from './login.dto';
import { JwtService } from '@nestjs/jwt';
import { SysMenuService } from '../system/menu/menu.service';
import { Cache } from 'cache-manager';

@Injectable()
export class LoginService {
  constructor(
    private util: UtilService,
    private menuService: SysMenuService,
    private userService: SysUserService,
    private logService: SysLogService,
    private jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
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
    await this.cacheManager.set(
      `admin:captcha:img:${result.id}`,
      svg.text,
      60 * 5,
    );
    return result;
  }
  /**
   * 校验验证码
   * @param id
   * @param code
   */
  async checkImgCaptcha(id: string, code: string): Promise<void> {
    const result: string = await this.cacheManager.get(
      `admin:captcha:img:${id}`,
    );
    if (isEmpty(result) || code.toLowerCase() !== result.toLowerCase()) {
      throw new ApiException(10002);
    }
    await this.cacheManager.del(`admin:captcha:img:${id}`);
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
  ): Promise<string> {
    const user = await this.userService.findUserByUserName(username);
    if (isEmpty(user)) {
      throw new ApiException(10003);
    }
    const comparePassword = this.util.md5(`${password}${user.psalt}`);
    if (user.password !== comparePassword) {
      throw new ApiException(10003);
    }
    const perms = await this.menuService.getPerms(user.id);
    // TODO 系统管理员开放多点登录
    if (user.id === 1) {
      const oldToken = await this.getRedisTokenById(user.id);
      if (oldToken) {
        return oldToken;
      }
    }
    const jwtSign = this.jwtService.sign(
      {
        uid: parseInt(user.id.toString()),
        pv: 1,
      },
      // {
      //   expiresIn: '24h',
      // },
    );
    await this.cacheManager.set(`admin:passwordVersion:${user.id}`, 1);
    // Token设置过期时间 24小时
    await this.cacheManager.set(
      `admin:token:${user.id}`,
      jwtSign,
      60 * 60 * 24,
    );
    await this.cacheManager.set(
      `admin:perms:${user.id}`,
      JSON.stringify(perms),
    );
    await this.logService.saveLoginLog(user.id, ip, ua);
    return jwtSign;
  }
  // /**
  //  * 获取token
  //  * @param payload
  //  * @returns
  //  */
  // getToken(payload: { id: string }) {
  //   // 访问令牌
  //   const accessToken = `Bearer ${this.jwtService.sign(payload)}`;
  //   // 刷新令牌
  //   const refreshToken = this.jwtService.sign(payload, {
  //     expiresIn: '12h',
  //   });
  //   return { accessToken, refreshToken };
  // }

  // refreshToken(id: string): string {
  //   return this.jwtService.sign({ id });
  // }

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
    return this.cacheManager.get(`admin:passwordVersion:${id}`);
  }

  /**
   * 通过 Id 获取 Redis 令牌
   * @param id
   */
  async getRedisTokenById(id: number): Promise<string> {
    return this.cacheManager.get(`admin:token:${id}`);
  }

  /**
   * 按 ID 获取 Redis Perms
   * @param id
   */
  async getRedisPermsById(id: number): Promise<string> {
    return this.cacheManager.get(`admin:perms:${id}`);
  }
}
