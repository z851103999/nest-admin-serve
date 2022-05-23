import {
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { ADMIN_PREFIX } from '../../admin.constants';
import { SysLogService } from './log.service';
import { Controller, Get, Query } from '@nestjs/common';
import { LoginLogInfo } from './log.class';
import { PageOptionsDto } from '../../../../common/dto/page.dto';
import { PageResult } from '../../../../common/class/res.class';
import { LogDisabled } from '../core/decorators/log-disabled.decorator';

@ApiSecurity(ADMIN_PREFIX)
@ApiTags()
@Controller('log')
export class SysLogController {
  constructor(private logService: SysLogService) {}

  @ApiOperation({ summary: '分页查询登录日志' })
  @ApiOkResponse({ type: [LoginLogInfo] })
  @LogDisabled()
  @Get('login/page')
  async loginLogPage(
    @Query() dto: PageOptionsDto,
  ): Promise<PageResult<LoginLogInfo>> {
    const list = await this.logService.pageGetLoginLog(dto.page - 1, dto.limit);
    const count = await this.logService.countLoginLog();
    return {
      list,
      pagination: {
        total: count,
        size: dto.limit,
        page: dto.page,
      },
    };
  }
}
