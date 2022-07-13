import { ADMIN_PREFIX } from '../../admin.constants';
import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { SysOnlineService } from './online.service';
import { OnlineUserInfo } from './online.class';
import { LogDisabled } from '../../core/decorators/log-disabled.decorator';
import { IAdminUser } from '../../admin.interface';
import { AdminUser } from '../../core/decorators/admin-user.decorator';
import { KickDto } from './online.dto';
import { ApiException } from '../../../../common/exceptions/api.exception';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags('在线用户模块')
@Controller('online')
export class SysOnlineController {
  constructor(private onlineService: SysOnlineService) {}

  @ApiOperation({ summary: '查询当前在线用户' })
  @ApiOkResponse({ type: [OnlineUserInfo] })
  @LogDisabled()
  @Get('list')
  async list(@AdminUser() user: IAdminUser): Promise<OnlineUserInfo[]> {
    return await this.onlineService.listOnlineUser(user.uid);
  }

  @ApiOperation({ summary: '下线指定在线用户' })
  @Post('kick')
  async kick(
    @Body() dto: KickDto,
    @AdminUser() user: IAdminUser,
  ): Promise<void> {
    if (dto.id === user.uid) {
      // 不能踢自己下线，如想下线自身可右上角退出
      throw new ApiException(10012);
    }
    await this.onlineService.kickUser(dto.id, user.uid);
  }
}
