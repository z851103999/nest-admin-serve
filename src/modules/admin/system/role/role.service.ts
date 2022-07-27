import { CreateRoleDto, UpdateRoleDto } from './role.dto';
import { ROOT_ROLE_ID } from 'src/modules/admin/admin.constants';
import SysRoleMenu from 'src/entities/admin/sys-role-menu.entity';
import SysRole from 'src/entities/admin/sys-role.entity';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Connection, In, Not, Repository } from 'typeorm';
import { CreateRoleId, RoleInfo } from './role.class';
import { difference, filter, includes, isEmpty, map } from 'lodash';
import SysRoleDepartment from 'src/entities/admin/sys-role-department.entity';
import { AdminWSService } from 'src/modules/ws/admin-ws.service';
import SysUserRole from '../../../../entities/admin/sys-user-role.entity';

@Injectable()
export class SysRoleService {
  constructor(
    @InjectRepository(SysRole)
    private roleRepository: Repository<SysRole>,
    @InjectRepository(SysRoleMenu)
    private roleMenuRepository: Repository<SysRoleMenu>,
    @InjectRepository(SysRoleDepartment)
    private roleDepartmentRepository: Repository<SysRoleDepartment>,
    @InjectRepository(SysRoleDepartment)
    private roleRolements: Repository<SysRoleDepartment>,
    private connection: Connection,
    @InjectRepository(SysUserRole)
    private userRoleRepository: Repository<SysUserRole>,
    @Inject(ROOT_ROLE_ID)
    private rootRoleId: number,
    private adminWSService: AdminWSService,
  ) {}

  /**
   * 列举所有角色：除去超级管理员
   * @returns
   */
  async list(): Promise<SysRole[]> {
    return await this.roleRepository.findBy({
      // 不能等于rootRoleId
      id: Not(this.rootRoleId),
    });
  }

  /**
   * 列举所有角色条数
   * @returns
   */
  async count(): Promise<number> {
    return await this.roleRepository.countBy({
      id: Not(this.rootRoleId),
    });
  }

  /**
   * 根据角色获取角色信息
   * @param rid
   * @returns
   */
  async info(rid: number): Promise<RoleInfo> {
    // 角色信息
    const roleInfo = await this.roleRepository.findOneBy({ id: rid });
    // 菜单
    const menus = await this.roleMenuRepository.findBy({ roleId: rid });
    // 部门信息
    const depts = await this.roleDepartmentRepository.findBy({ roleId: rid });
    return { roleInfo, menus, depts };
  }

  /**
   * 根据角色获取角色信息
   * @param roleIds
   */
  async delete(roleIds: number[]): Promise<void> {
    // 是否在集合里
    if (includes(roleIds, this.rootRoleId)) {
      throw new Error('Not Support Delete Root （不支持删除节点）');
    }

    const queryRunner = this.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.delete(SysRole, roleIds);
      await queryRunner.manager.delete(SysRoleMenu, { roleId: In(roleIds) });
      await queryRunner.manager.delete(SysRoleDepartment, {
        roleId: In(roleIds),
      });
    } catch (err) {
      await queryRunner.rollbackTransaction();
      console.log(err);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 添加角色
   * @param param
   * @param uid
   * @returns
   */
  async add(param: CreateRoleDto, uid: number): Promise<CreateRoleId> {
    const { name, label, remark, menus, depts } = param;
    const role = await this.roleRepository.insert({
      name,
      label,
      remark,
      userId: `${uid}`,
    });
    const { identifiers } = role;
    const roleId = parseInt(identifiers[0].id);
    if (menus && menus.length > 0) {
      // 关联菜单
      const inserRows = menus.map((m) => {
        return {
          roleId,
          menuId: m,
        };
      });
      await this.roleMenuRepository.insert(inserRows);
    }
    if (depts && depts.length > 0) {
      const insertRows = depts.map((d) => {
        return {
          roleId,
          departmentd: d,
        };
      });
      await this.roleDepartmentRepository.insert(insertRows);
    }
    return { roleId };
  }

  /**
   * 更新角色信息
   * @param param
   */
  async update(param: UpdateRoleDto): Promise<SysRole> {
    const { roleId, name, label, remark, menus, depts } = param;
    const role = await this.roleRepository.save({
      id: roleId,
      name,
      label,
      remark,
    });
    const originDeptRows = await this.roleDepartmentRepository.findBy({
      roleId,
    });
    const originMenuRows = await this.roleMenuRepository.findBy({ roleId });
    const originMenuIds = originMenuRows.map((e) => {
      return e.menuId;
    });
    const originDeptIds = originDeptRows.map((e) => {
      return e.departmentId;
    });
    // 开始对比差异
    const insertMenusRowIds = difference(menus, originMenuIds);
    const deleteMenusRowIds = difference(originMenuIds, menus);
    const insertDeptRowIds = difference(depts, originDeptIds);
    const deleteDeptRowIds = difference(originDeptIds, depts);

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 菜单
      if (insertMenusRowIds.length > 0) {
        // 有条目更新
        const insertRows = insertMenusRowIds.map((e) => {
          return {
            roleId,
            menuId: e,
          };
        });
        await queryRunner.manager.insert(SysRoleMenu, insertRows);
      }
      if (deleteMenusRowIds.length > 0) {
        //  有条目需要删除
        const realDeleteRowIds = filter(originMenuRows, (e) => {
          return includes(deleteMenusRowIds, e.menuId);
        }).map((e) => {
          return e.id;
        });
        await queryRunner.manager.delete(SysRoleMenu, realDeleteRowIds);
      }
      // 部门
      if (insertDeptRowIds.length > 0) {
        // 有条目更新
        const insertRows = insertDeptRowIds.map((e) => {
          return {
            roleId,
            departmentId: e,
          };
        });
        await queryRunner.manager.insert(SysRoleDepartment, insertRows);
      }
      if (deleteDeptRowIds.length > 0) {
        // 有条目需要删除
        const realDeleteRowIds = filter(originDeptRows, (e) => {
          return includes(deleteDeptRowIds, e.departmentId);
        }).map((e) => {
          return e.id;
        });
        await queryRunner.manager.delete(SysRoleDepartment, realDeleteRowIds);
      }
    } catch (e) {
      await queryRunner.rollbackTransaction();
      throw new Error(e);
    } finally {
      await queryRunner.release();
    }
    // 如果勾选了新的菜单或取消勾选了原有菜单，则通知前端重新获取权限菜单
    if ([insertDeptRowIds, deleteDeptRowIds].some((n) => n.length)) {
      await this.adminWSService.noticeUserToUpdateMenusByRoleIds([roleId]);
    }
    return role;
  }

  /**
   * 分页加载角色信息
   * @param page
   * @param count
   */
  async page(page: number, count: number): Promise<SysRole[]> {
    return await this.roleRepository.find({
      where: {
        id: Not(this.rootRoleId),
      },
      order: {
        id: 'ASC',
      },
      take: count,
      skip: page * count,
    });
  }

  /**
   * 更具用户ID查找角色信息
   * @param id
   */
  async getRoleIdByUser(id: number): Promise<number[]> {
    const result = await this.userRoleRepository.find({
      where: {
        userId: id,
      },
    });
    if (!isEmpty(result)) {
      return map(result, (v) => {
        return v.roleId;
      });
    }
    return [];
  }

  /**
   * 根据角色ID列表查找关联用户ID
   * @param ids
   */
  async countUserIdByRole(ids: number[]): Promise<number | never> {
    if (includes(ids, this.rootRoleId)) {
      throw new Error('Not Support Delete Root');
    }
    return await this.userRoleRepository.countBy({ roleId: In(ids) });
  }
}
