import { FactoryProvider } from '@nestjs/common';
import { ROOT_ROLE_ID } from 'src/modules/admin/admin.constants';
import { ConfigService } from '@nestjs/config';

/**
 * 提供使用 @Inject {ROOT_ROLE_ID} 直接使用RootRoleId
 */
export function rootRoleIDProvider(): FactoryProvider {
  return {
    provide: ROOT_ROLE_ID,
    useFactory: (configService: ConfigService) => {
      return configService.get<number>('rootRoleId', 1);
    },
    inject: [ConfigService],
  };
}
