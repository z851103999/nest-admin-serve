import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class ReqLoginDto {
  /* uuid码 */
  @ApiProperty({ description: 'uuid' })
  @IsString()
  uuid: string;

  /* 验证码code */
  @ApiProperty({ description: '验证码code' })
  @IsString()
  code: string;

  /* 用户名 */
  @ApiProperty({ description: '用户名' })
  @IsString()
  username: string;

  /* 密码 */
  @ApiProperty({ description: '密码' })
  @IsString()
  password: string;
}
