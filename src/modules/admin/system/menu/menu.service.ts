import { MenuItemAndParentInfoResult } from './menu.class';
import { ApiException } from './../../../../common/exceptions/api.exception';
import { includes, isEmpty, concat, uniq } from 'lodash';
import { SysRoleService } from './../role/role.service';
import { ROOT_ROLE_ID } from 'src/modules/admin/admin.constants';
import { InjectRepository } from '@nestjs/typeorm';
import SysMenu from '../../../../entities/admin/sys-menu.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { CACHE_MANAGER, Inject } from '@nestjs/common';
import { CreateMenuDto } from './menu.dto';
import { RedisService } from '@/shared/services/redis.service';

export class SysMenuService {
  constructor(
    @InjectRepository(SysMenu)
    private menuRepository: Repository<SysMenu>,
    @Inject(ROOT_ROLE_ID)
    private rootRoleId: number,
    private roleService: SysRoleService,
    @Inject(CACHE_MANAGER)
    private redisService: RedisService,
  ) {}

  /**
   * 获取所有菜单
   */
  async list(): Promise<SysMenu[]> {
    return await this.menuRepository.find();
  }
  /**
   * 保存或新增菜单
   * @param menu
   */
  async save(menu: CreateMenuDto & { id?: number }): Promise<void> {
    await this.menuRepository.save(menu);
    // 通过roleIds通知用户更新权限菜单
  }
  /**
   * 根据角色获取所有菜单
   * @param uid
   * @returns
   */
  async getMenus(uid: number): Promise<SysMenu[]> {
    const roleIds = await this.roleService.getRoleIdByUser(uid);
    let menus: SysMenu[] = [];
    if (includes(roleIds, this.rootRoleId)) {
      menus = await this.menuRepository.find();
    } else {
      menus = await this.menuRepository
        .createQueryBuilder('menu')
        .innerJoinAndSelect(
          'sys_role_menu',
          'role_menu',
          'menu.id = role_menu.menu_id',
        )
        .andWhere('role_menu.role_id IN (: ...roldIds)', { roleIds: roleIds })
        .orderBy('menu.order_num', 'DESC')
        .getMany();
    }
    return menus;
  }
  /**
   * 检查菜单创建规则是否符合
   */
  async check(dto: CreateMenuDto & { menuId?: number }): Promise<void | never> {
    if (dto.type === 2 && dto.parentId === -1) {
      // 无法直接创建权限，必须有ParentId
      throw new ApiException(10005);
    }
    if (dto.type === 1 && dto.parentId !== 1) {
      const parent = await this.getMenuItemInfo(dto.parentId);
      if (isEmpty(parent)) {
        throw new ApiException(10014);
      }
      if (parent && parent.type === 1) {
        // 当前新增为菜单但父节点也为菜单时为非法操作
        throw new ApiException(10006);
      }
    }
    // 判断一级菜单路由是否重复
    if (Object.is(dto.parentId, -1) && Object.is(dto.type, 0)) {
      const rootMenus = await this.menuRepository.findBy({
        parentId: null,
        id: Not(dto.menuId),
      });
      const path = dto.router.split('/').filter(Boolean).join('/');
      const pathReg = new RegExp(`^/?${path}/?$`);
      const isExist = rootMenus.some((n) => pathReg.test(n.router));
      if (isExist) {
        // 一级菜单路由不能重复
        throw new ApiException(10004);
      }
    }
  }
  /**
   * 查找当前菜单下的子菜单，目录及其菜单
   * @param mid
   */
  async findChildMenus(mid: number): Promise<any> {
    const allMenus: any = [];
    const menus = await this.menuRepository.findBy({ parentId: mid });
    for (let i = 0; i < menus.length; i++) {
      if (menus[i].type !== 2) {
        // 子目录下是菜单或目录，继续往下级查找
        const c = await this.findChildMenus(menus[i].id);
        allMenus.push(c);
      }
      allMenus.push(menus[i].id);
    }
    return allMenus;
  }

  /**
   * 获取某个菜单的信息
   * @param mid
   * @returns
   */
  async getMenuItemInfo(mid: number): Promise<SysMenu> {
    return await this.menuRepository.findOneBy({ id: mid });
  }
  /**
   * 获取某个菜单以及关联的父菜单的信息
   * @param mid
   * @returns
   */
  async getMenuItemAndParentInfo(
    mid: number,
  ): Promise<MenuItemAndParentInfoResult> {
    const menu = await this.menuRepository.findOneBy({ id: mid });
    let parentMenu;
    if (menu && menu.parentId) {
      parentMenu = await this.menuRepository.findBy({ id: menu.parentId });
    }
    return { menu, parentMenu };
  }
  /**
   * 查找节点路由是否存在
   * @param router
   * @returns
   */
  async findRouterExist(router: string): Promise<boolean> {
    const menus = await this.menuRepository.findOneBy({ router });
    return !isEmpty(menus);
  }

  /**
   * 获取当前用户的所有权限
   * @param uid
   * @returns
   */
  async getPerms(uid: number): Promise<string[]> {
    const roleIds = await this.roleService.getRoleIdByUser(uid);
    let perms: any[] = [];
    let result: any = null;
    if (includes(roleIds, this.rootRoleId)) {
      result = await this.menuRepository.findBy({
        perms: Not(IsNull()),
        type: 2,
      });
    } else {
      result = await this.menuRepository
        .createQueryBuilder('menu')
        .innerJoinAndSelect(
          'sys_role_menu',
          'role_menu',
          'menu.id= role_menu.menu_id',
        )
        .andWhere('role_menu.role_id IN (:...roleIds)', { roleIds: roleIds });
    }
    if (!isEmpty(result)) {
      result.forEach((e) => {
        perms = concat(perms, e.perms.split(','));
      });
      // 去重
      perms = uniq(perms);
    }
    return perms;
  }
  /**
   * 删除多项菜单
   * @param mids
   */
  async deleteMenuItem(mids: number[]): Promise<void> {
    await this.menuRepository.delete(mids);
  }
  /**
   * 刷新指定用户ID的权限
   * @param uid
   */
  async refreshPerms(uid: number): Promise<void> {
    const perms = await this.getPerms(uid);
    const online = await this.redisService.getRedis().get(`admin:token:${uid}`);
    if (online) {
      await this.redisService
        .getRedis()
        .set(`admin:perms:${uid}`, JSON.stringify(perms));
    }
  }
  /**
   * 刷新所有在线用户的权限
   */
  async refreshOnlineUserPerms(): Promise<void> {
    const onlineUserIds: string[] = await this.redisService
      .getRedis()
      .keys('admin:token:*');
    if (onlineUserIds && onlineUserIds.length > 0) {
      for (let i = 0; i < onlineUserIds.length; i++) {
        const uid = onlineUserIds[i].split('admin:token:')[i];
        const perms = await this.getPerms(parseInt(uid));
        await this.redisService
          .getRedis()
          .set(`admin:perms:${uid}`, JSON.stringify(perms));
      }
    }
  }
}
