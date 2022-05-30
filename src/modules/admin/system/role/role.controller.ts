import { PageResult } from 'src/common/class/res.class';
import { PageOptionsDto } from 'src/common/dto/page.dto';
import {
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiOkResponse,
} from '@nestjs/swagger';
import { ADMIN_PREFIX } from '../../admin.constants';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { SysRoleService } from './role.service';
import { SysMenuService } from '../menu/menu.service';
import SysRole from 'src/entities/admin/sys-role.entity';
import { ApiException } from 'src/common/exceptions/api.exception';
import { IAdminUser } from '../../admin.interface';
import { AdminUser } from '../../core/decorators/admin-user.decorator';
import { RoleInfo } from './role.class';
import {
  DeleteRoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  InfoRoleDto,
} from './role.dto';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('角色模块')
@Controller('role')
export class SysRoleController {
  constructor(
    private roleService: SysRoleService,
    private menuService: SysMenuService,
  ) {}

  @ApiOperation({ summary: '获取角色列表' })
  @ApiOkResponse({ type: [SysRole] })
  @Get('list')
  async list(): Promise<SysRole[]> {
    return await this.roleService.list();
  }

  @ApiOperation({ summary: '分页查询角色信息' })
  @ApiOkResponse({ type: [SysRole] })
  @Get('page')
  async page(@Query() dto: PageOptionsDto): Promise<PageResult<SysRole>> {
    const list = await this.roleService.page(dto.page - 1, dto.limit);
    const count = await this.roleService.count();
    return {
      list,
      pagination: {
        size: dto.limit,
        page: dto.page,
        total: count,
      },
    };
  }

  @ApiOperation({ summary: '删除角色' })
  @Post('delete')
  async delete(@Body() dto: DeleteRoleDto): Promise<void> {
    const count = await this.roleService.countUserIdByRole(dto.roleIds);
    if (count > 0) {
      throw new ApiException(10008);
    }
    await this.roleService.delete(dto.roleIds);
    await this.menuService.refreshOnlineUserPerms();
  }

  @ApiOperation({ summary: '新增角色' })
  @Post('add')
  async add(
    @Body() dto: CreateRoleDto,
    @AdminUser() user: IAdminUser,
  ): Promise<void> {
    await this.roleService.add(dto, user.uid);
  }

  @ApiOperation({ summary: '更新角色' })
  @Post('update')
  async update(@Body() dto: UpdateRoleDto): Promise<void> {
    await this.roleService.update(dto);
    await this.menuService.refreshOnlineUserPerms();
  }

  @ApiOperation({ summary: '获取角色信息' })
  @ApiOkResponse({ type: RoleInfo })
  @Get('info')
  async info(@Query() dto: InfoRoleDto): Promise<RoleInfo> {
    return await this.roleService.info(dto.roleId);
  }
}
