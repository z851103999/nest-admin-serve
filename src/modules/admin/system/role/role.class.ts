import SysRoleMenu from 'src/entities/admin/sys-role-menu.entity';
import { ApiProperty } from '@nestjs/swagger';
import SysRole from 'src/entities/admin/sys-role.entity';
import SysRoleDepartment from 'src/entities/admin/sys-role-department.entity';
export class RoleInfo {
  @ApiProperty({
    type: SysRole,
  })
  roleInfo: SysRole;

  @ApiProperty({ type: [SysRoleMenu] })
  menus: SysRoleMenu[];

  @ApiProperty({ type: [SysRoleDepartment] })
  depts: SysRoleDepartment[];
}

export class CreateRoleId {
  roleId: number;
}
