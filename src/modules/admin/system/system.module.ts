import { SysMenuController } from './menu/menu.controller';
import { SysRoleController } from './role/role.controller';
import { SysUserController } from './user/user.controller';
import { WSModule } from './../../ ws/ws.module';
import SysConfig from 'src/entities/admin/sys-config.entity';
import SysUserRole from 'src/entities/admin/sys-user-role.entity';
import SysRoleDepartment from 'src/entities/admin/sys-role-department.entity';
import SysRole from 'src/entities/admin/sys-role.entity';
import SysRoleMenu from 'src/entities/admin/sys-role-menu.entity';
import SysMenu from 'src/entities/admin/sys-menu.entity';
import SysUser from 'src/entities/admin/sys-user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { ROOT_ROLE_ID } from '../admin.constants';
import { SysLogService } from './log/log.service';
import { SysMenuService } from './menu/menu.service';
import { SysParamConfigService } from './param-config/param-config.service';
import { SysRoleService } from './role/role.service';
import { SysServeService } from './serve/serve.service';
import { SysUserService } from './user/user.service';
import { rootRoleIdProvider } from '../core/provider/root-role-id.provider';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      SysUser,
      SysUserRole,
      SysMenu,
      SysRoleMenu,
      SysRole,
      SysRoleDepartment,
      SysUserRole,
      SysConfig,
    ]),
    WSModule,
  ],
  controllers: [SysUserController, SysRoleController, SysMenuController],
  providers: [
    rootRoleIdProvider(),
    SysUserService,
    SysRoleService,
    SysMenuService,
    SysLogService,
    SysParamConfigService,
    SysServeService,
  ],
  exports: [
    ROOT_ROLE_ID,
    TypeOrmModule,
    SysUserService,
    SysMenuService,
    SysLogService,
  ],
})
export class SystemModule {}
