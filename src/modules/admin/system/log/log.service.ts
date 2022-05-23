import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SysLoginLog from '../../../../entities/admin/sys-login-log.entity';
import { UAParser } from 'ua-parser-js';
import { LoginLogInfo } from './log.class';

@Injectable()
export class SysLogService {
  constructor(
    @InjectRepository(SysLoginLog)
    private loginLogRepository: Repository<SysLoginLog>,
  ) {}

  /**
   * 保存登录日志
   * @param uid
   * @param ip
   * @param ua
   */
  async saveLoginLog(uid: number, ip: string, ua: string): Promise<void> {
    await this.loginLogRepository.save({
      ip,
      userId: uid,
      ua,
    });
  }

  /**
   * 计算登录日志的总数
   */
  async countLoginLog(): Promise<number> {
    return await this.loginLogRepository.count();
  }

  /**
   * 分页加载日志信息
   * @param page 页数
   * @param count 个数
   */
  async pageGetLoginLog(page: number, count: number): Promise<LoginLogInfo[]> {
    const result = await this.loginLogRepository
      .createQueryBuilder('login_log')
      .innerJoinAndSelect('sys_user', 'user', 'login_log.user_id = user.id')
      .orderBy('login_log.created_at', 'DESC')
      .offset(page * count)
      .limit(count)
      .getRawMany();
    const parser = new UAParser();
    return result.map((e) => {
      const u = parser.setUA(e.login_log_ua).getResult();
      return {
        id: e.login_log_id,
        ip: e.login_log_ip,
        os: `${u.os.name}${u.os.version}`,
        browser: `${u.browser.name}${u.browser.version}`,
        time: e.login_log_create_at,
        username: e.user_username,
      };
    });
  }

  /**
   * 清空表中的所有数据
   */
  async clearLoginLog(): Promise<void> {
    await this.loginLogRepository.clear();
  }
}
