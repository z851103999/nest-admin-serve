import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { User } from 'src/modules/system/user/entities/user.entity';

export class ResImageCaptchaDto {
  /* base64图片编码 */
  @ApiProperty({ description: 'base64图片编码' })
  @IsString()
  img: string;

  /* uuid码 */
  @ApiProperty({ description: 'uuid' })
  @IsString()
  uuid: string;
}

export class ResLoginDto {
  /* token密匙 */
  @ApiProperty({ description: 'token密匙' })
  token: string;
}

export class ResInfo {
  /* 权限标识 */
  @ApiProperty({ description: '权限标识' })
  permissions: string[];

  /* 角色标识 */
  @ApiProperty({ description: '角色标识' })
  roles: string[];

  /* 用户信息 */
  @ApiProperty({ description: '用户信息' })
  user: User;
}
