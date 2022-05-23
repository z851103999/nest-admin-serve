import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminWsService } from './admin-ws.service';
import { AuthService } from './auth.service';
import { AdminWSGateway } from './admin-ws.gateway';
import { Module } from '@nestjs/common';
import SysRoleMenu from 'src/entities/admin/sys-role-menu.entity';
import SysUserRole from 'src/entities/admin/sys-user-role.entity';

const providers = [AdminWSGateway, AuthService, AdminWsService];

@Module({
  imports: [TypeOrmModule.forFeature([SysUserRole, SysRoleMenu])],
  providers,
  exports: providers,
})
export class WSModule {}
