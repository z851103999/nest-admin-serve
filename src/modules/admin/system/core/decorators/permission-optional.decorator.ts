import { PERMISSION_OPTIONAL_KEY_METADATA } from 'src/modules/admin/admin.constants';
import { SetMetadata } from '@nestjs/common';

/**
 * 使用该注解可开发API权限，无需权限访问，但是仍然需要校验身份Token
 * @constructor
 */
export const PermissionOptional = () => {
  SetMetadata(PERMISSION_OPTIONAL_KEY_METADATA, true);
};
