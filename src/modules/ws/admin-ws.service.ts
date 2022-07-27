import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import SysRoleMenu from '../../entities/admin/sys-role-menu.entity';
import { AdminWSGateway } from './admin-ws.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import SysUserRole from '../../entities/admin/sys-user-role.entity';
import { RemoteSocket } from 'socket.io';

@Injectable()
export class AdminWSService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(SysRoleMenu)
    private roleMenuRepository: Repository<SysRoleMenu>,
    @InjectRepository(SysUserRole)
    private userRoleRepository: Repository<SysUserRole>,
    private adminWsGateWay: AdminWSGateway,
  ) {}

  /**
   * 获取当前用户
   */
  async getOnlineSockets() {
    const onlineSockets = await this.adminWsGateWay.socketServer.fetchSockets();
    return onlineSockets;
  }

  /**
   * 根据UID查找socketID
   */
  async findSocketIdByUid(uid: number): Promise<RemoteSocket<any, any>> {
    const onlineSockets = await this.getOnlineSockets();
    const socket = onlineSockets.find((socket) => {
      const token = socket.handshake.query?.token as string;
      const tokenUid = this.jwtService.verify(token).uid;
      return tokenUid === uid;
    });
    return socket;
  }

  /**
   * 根据uid数组过滤出socketID
   * @param uids
   */
  async filterSocketIdByUidArr(
    uids: number[],
  ): Promise<RemoteSocket<any, any>[]> {
    const onlineSockets = await this.getOnlineSockets();
    const sockets = onlineSockets.filter((socket) => {
      const token = socket.handshake.query?.token as string;
      const tokenUid = this.jwtService.verify(token).uid;
      return uids.includes(tokenUid);
    });
    return sockets;
  }

  /**
   * 通过menuIds通知用户更新权限菜单
   */
  async noticeUserToUpdateMenusByMenuIds(menuIds: number[]): Promise<void> {
    const roleMenus = await this.roleMenuRepository.findBy({
      menuId: In(menuIds),
    });
    const roleIds = roleMenus.map((n) => n.roleId);
    await this.noticeUserToUpdateMenusByRoleIds(roleIds);
  }

  /**
   * 通过roleIds通知用户更新权限菜单
   */
  async noticeUserToUpdateMenusByRoleIds(roleIds: number[]): Promise<void> {
    const users = await this.userRoleRepository.findBy({
      roleId: In(roleIds),
    });
    if (users) {
      const userIds = users.map((n) => n.userId);
      await this.noticeUserToUpdateMenusByMenuIds(userIds);
    }
  }
}
