import { HttpRequestJob } from './jobs/http-request.job';
import { SysLogClearJob } from './jobs/sys-log-clear.job';
import { ExistingProvider, Module, DynamicModule } from '@nestjs/common';
import { AdminModule } from '@/modules/admin/admin.module';
import { SysLogService } from '@/modules/admin/system/log/log.service';

const providers = [SysLogClearJob, HttpRequestJob];
/**
 * 创建别名
 * @returns
 */
function createAliasProviders(): ExistingProvider[] {
  const aliasProviders: ExistingProvider[] = [];
  for (const p of providers) {
    aliasProviders.push({
      provide: p.name,
      useExisting: p,
    });
  }
  return aliasProviders;
}

@Module({})
export class MissionModule {
  static forRoot(): DynamicModule {
    // 使用alias 定义别名，使得可以通过字符串类型获得定义的Service，否则无法获得
    const aliasProviders = createAliasProviders();
    return {
      global: true,
      module: MissionModule,
      imports: [AdminModule],
      providers: [...providers, ...aliasProviders, SysLogService],
      exports: aliasProviders,
    };
  }
}
