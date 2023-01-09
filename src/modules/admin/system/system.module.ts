import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  ROOT_ROLE_ID,
  SYS_TASK_QUEUE_NAME,
  SYS_TASK_QUEUE_PREFIX,
} from '@/modules/admin/admin.constants';
import SysDepartment from '@/entities/admin/sys-department.entity';
import SysLoginLog from '@/entities/admin/sys-login-log.entity';
import SysMenu from '@/entities/admin/sys-menu.entity';
import SysRoleDepartment from '@/entities/admin/sys-role-department.entity';
import SysRoleMenu from '@/entities/admin/sys-role-menu.entity';
import SysRole from '@/entities/admin/sys-role.entity';
import SysUserRole from '@/entities/admin/sys-user-role.entity';
import SysUser from '@/entities/admin/sys-user.entity';
import { rootRoleIdProvider } from '../core/provider/root-role-id.provider';
import { SysDeptController } from './dept/dept.controller';
import { SysDeptService } from './dept/dept.service';
import { SysLogController } from './log/log.controller';
import { SysLogService } from './log/log.service';
import { SysMenuController } from './menu/menu.controller';
import { SysMenuService } from './menu/menu.service';
import { SysRoleController } from './role/role.controller';
import { SysRoleService } from './role/role.service';
import { SysUserController } from './user/user.controller';
import { SysUserService } from './user/user.service';
import { SysOnlineController } from './online/online.controller';
import { SysOnlineService } from './online/online.service';
import SysConfig from '@/entities/admin/sys-config.entity';
import { SysParamConfigController } from './param-config/param-config.controller';
import { SysParamConfigService } from './param-config/param-config.service';
import { SysServeController } from './serve/serve.controller';
import { SysServeService } from './serve/serve.service';
import SysTask from '@/entities/admin/sys-task.entity';
import SysTaskLog from '@/entities/admin/sys-task-log.entity';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigurationKeyPaths } from '@/config/configuration';
import { SysTaskController } from './task/task.controller';
import { SysTaskService } from './task/task.service';
import { SysTaskConsumer } from './task/task.processor';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SysUser,
      SysDepartment,
      SysUserRole,
      SysMenu,
      SysRoleMenu,
      SysRole,
      SysRoleDepartment,
      SysUserRole,
      SysLoginLog,
      SysTask,
      SysTaskLog,
      SysConfig,
    ]),
    BullModule.registerQueueAsync({
      name: SYS_TASK_QUEUE_NAME,
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<ConfigurationKeyPaths>) => ({
        redis: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
          password: configService.get<string>('redis.password'),
          db: configService.get<number>('redis.db'),
        },
        prefix: SYS_TASK_QUEUE_PREFIX,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    SysUserController,
    SysRoleController,
    SysMenuController,
    SysDeptController,
    SysLogController,
    SysTaskController,
    SysOnlineController,
    SysParamConfigController,
    SysServeController,
  ],
  providers: [
    rootRoleIdProvider(),
    SysUserService,
    SysRoleService,
    SysMenuService,
    SysDeptService,
    SysLogService,
    SysTaskService,
    SysTaskConsumer,
    SysOnlineService,
    SysParamConfigService,
    SysServeService,
  ],
  exports: [
    ROOT_ROLE_ID,
    TypeOrmModule,
    SysUserService,
    SysMenuService,
    SysLogService,
    SysOnlineService,
  ],
})
export class SystemModule {}
