import { Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
import { AccountModule } from './account/account.module';
import { ADMIN_PREFIX } from './admin.constants';
import { AuthGuard } from './core/guards/auth.guard';
import { LoginModule } from './login/login.module';
import { SystemModule } from './system/system.module';


/**
 * Admin模块，所有API都需要加入/admin前缀
 */
@Module({
  imports: [
    // 注册前缀
    RouterModule.register([
      {
        path: ADMIN_PREFIX,
        children: [
          { path: 'account', module: AccountModule },
          { path: 'sys', module: SystemModule },
        ],
      },
      // like this url /admin/captcha/img
      {
        path: ADMIN_PREFIX,
        module: LoginModule,
      },
    ]),
    // component module
    LoginModule,
    SystemModule,
    AccountModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  exports: [SystemModule],
})
export class AdminModule {}
