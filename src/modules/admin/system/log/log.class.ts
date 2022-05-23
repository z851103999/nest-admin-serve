import { ApiException } from '../../../../common/exceptions/api.exception';
import { ApiProperty } from '@nestjs/swagger';

export class LoginLogInfo {
  @ApiProperty({ description: '日志编号' })
  id: number;

  @ApiProperty({ description: '登录IP' })
  ip: string;

  @ApiProperty({ description: '系统' })
  os: string;

  @ApiProperty({ description: '浏览器' })
  browser: string;

  @ApiProperty({ description: '时间' })
  time: string;

  @ApiProperty({ description: '登录用户名' })
  username: string;
}
