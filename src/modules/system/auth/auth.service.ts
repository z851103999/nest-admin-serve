import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import {
  CAPTCHA_IMG_KEY,
  USER_TOKEN_KEY,
  USER_VERSION_KEY,
} from 'src/common/contants/redis.contant';
import { ApiException } from 'src/common/exceptions/api.exception';
import { SharedService } from 'src/shared/shared.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly sharedService: SharedService,
    private readonly userService: UserService,
  ) {}

  /* 判断验证码是否正确 */
  async checkImgCaptcha(uuid: string, code: string) {
    const result = await this.redis.get(`${CAPTCHA_IMG_KEY}:${uuid}`);
    if (isEmpty(result) || code.toLowerCase() !== result.toLowerCase()) {
      // 验证码错误
      throw new ApiException(10001, 401);
    }
    await this.redis.del(`${CAPTCHA_IMG_KEY}:${uuid}`);
  }

  /* 判断用户账号密码是否正确 */
  async validateUser(username: string, password: string) {
    const user = await this.userService.findOneByUsername(username);
    // 没有找到用户
    if (!user) throw new ApiException(10002, 401);
    const comparePassword = this.sharedService.md5(password + user.salt);
    if (comparePassword !== user.password) throw new ApiException(10003, 401);
    return user;
  }

  /* 判断token 是否过期 或者被重置 */
  async validateToken(userId: number, pv: number, restoken: string) {
    const token = await this.redis.get(`${USER_TOKEN_KEY}:${userId}`);
    if (restoken !== token) throw new ApiException(10004, 401);
    const passwordVersion = parseInt(
      await this.redis.get(`${USER_VERSION_KEY}:${userId}`),
    );
    if (pv !== passwordVersion) throw new ApiException(10000, 401);
  }
}
