import { ApiProperty } from '@nestjs/swagger';
import SysMenu from '../../../entities/admin/sys-role-menu.entity';
/**
 * 图片验证码 class
 */
export class ImageCaptcha {
  @ApiProperty({
    description: 'base64格式的svg图片',
  })
  img: string;

  @ApiProperty({ description: '验证码对应的唯一ID' })
  id: string;
}

/**
 * 登录令牌 class
 */
export class LoginToken {
  @ApiProperty({ description: 'JWT身份Token' })
  token: string;
}

/**
 * 菜单信息 class
 */
export class PermMenuInfo {
  @ApiProperty({ description: '菜单列表', type: [SysMenu] })
  menus: SysMenu[];

  @ApiProperty({ description: '权限列表', type: [String] })
  perms: string[];
}
