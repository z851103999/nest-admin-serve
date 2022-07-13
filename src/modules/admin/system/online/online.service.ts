import { JwtService } from '@nestjs/jwt';
import { AdminWSGateway } from '../../../ws/admin-ws.gateway';
import { AdminWSService } from '../../../ws/admin-ws.service';
import { SysUserService } from '../user/user.service';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm/entity-manager/EntityManager';
import { OnlineUserInfo } from './online.class';
import { UAParser } from 'ua-parser-js';
import { ApiException } from '../../../../common/exceptions/api.exception';
import { EVENT_KICE } from '../../../ws/ws.event';

@Injectable()
export class SysOnlineService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    private userService: SysUserService,
    private adminWsGateWay: AdminWSGateway,
    private adminWSService: AdminWSService,
    private jwtService: JwtService,
  ) {}

  /**
   * 在线用户列表
   * @param currentUid
   */
  async listOnlineUser(currentUid: number): Promise<OnlineUserInfo[]> {
    const onlineSockets = await this.adminWSService.getOnlineSockets();
    if (!onlineSockets || onlineSockets.length <= 0) {
      return [];
    }
    const onlineIds = onlineSockets.map((socket) => {
      const token = socket.handshake.query?.token as string;
      return this.jwtService.verify(token).uid;
    });
    return await this.findLastLoginInfoList(onlineIds, currentUid);
  }

  /**
   * 下线当前用户
   * @param uid
   * @param currentUid
   */
  async kickUser(uid: number, currentUid: number): Promise<void> {
    const rootUserId = await this.userService.findRootUserId();
    const currentUserInfo = await this.userService.getAccountInfo(currentUid);
    if (uid === rootUserId) {
      throw new ApiException(10013);
    }
    await this.userService.forbidden(uid);
    const socket = await this.adminWSService.findSocketIdByUid(uid);
    if (socket) {
      this.adminWsGateWay.socketServer
        .to(socket.id)
        .emit(EVENT_KICE, { operater: currentUserInfo.name });
    }
  }

  /**
   * 根据用户ID列表查找最近登录信息和用户信息
   * @param ids
   * @param currentUid
   */
  async findLastLoginInfoList(
    ids: number[],
    currentUid: number,
  ): Promise<OnlineUserInfo[]> {
    const rootUserId = await this.userService.findRootUserId();
    const result = await this.entityManager.query(
      `
      SELECT sys_login_log.created_at, sys_login_log.ip, sys_login_log.ua, sys_user.id, sys_user.username, sys_user.name
        FROM sys_login_log
        INNER JOIN sys_user ON sys_login_log.user_id = sys_user.id
        WHERE sys_login_log.created_at IN (SELECT MAX(created_at) as createdAt FROM sys_login_log GROUP BY user_id)
          AND sys_user.id IN (?)
      `,
      [ids],
    );
    // const result = await this.entityManager
    //   .createQueryBuilder('login_user')
    //   .innerJoinAndSelect('sys_user', 'sys_login_log.user_id = sys_user.id')
    //   .where('sys_login_log.create_at IN select(max(created_at))')
    //   .orderBy('user_id', 'DESC')
    //   .getMany();

    if (result) {
      const parser = new UAParser();
      return result.map((e) => {
        const u = parser.setUA(e.ua).getResult();
        return {
          id: e.id,
          ip: e.ip,
          username: `${e.name}（${e.username}）`,
          isCurrent: currentUid === e.id,
          time: e.created_at,
          os: `${u.os.name} ${u.os.version}`,
          browser: `${u.browser.name} ${u.browser.version}`,
          disable: currentUid === e.id || e.id === rootUserId,
        };
      });
    }
    return [];
  }
}
