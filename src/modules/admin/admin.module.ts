import { Module } from '@nestjs/common';
import { APP_GUARD, RouterModule } from '@nestjs/core';
// import { AccountModule } from './account/account.module';
import { ADMIN_PREFIX } from './admin.constants';
import { AuthGuard } from './core/guards/auth.guard';
// import { LoginModule } from './login/login.module';
import { SystemModule } from './system/system.module';
@Module({
  imports: [
    RouterModule.register([
      {
        path: ADMIN_PREFIX,
        children: [
          { path: 'sys', module: SystemModule },
          // { path: 'account', module: AccountModule },
        ],
      },
      {
        path: ADMIN_PREFIX,
        // module: LoginModule,
      },
    ]),
    // LoginModule,
    SystemModule,
    // AccountModule,
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
