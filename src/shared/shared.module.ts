import {
  LoggerModuleOptions,
  WinstonLogLevel,
} from './logger/logger.interface';
import { TypeORMLoggerService } from './logger/typeorm-logger.service';
import { SharedService } from './shared.service';
import { Global, Module, ValidationPipe } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from '@nestjs-modules/ioredis';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ReponseTransformInterceptor } from 'src/common/interceptors/reponse-transform.interceptor';
import { OperationLogInterceptor } from 'src/common/interceptors/operation-log.interceptor';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { PermissionAuthGuard } from 'src/common/guards/permission-auth.guard';
import { RoleAuthGuard } from 'src/common/guards/role-auth.guard';
import { LogModule } from 'src/modules/monitor/log/log.module';
import { BullModule } from '@nestjs/bull';
import { DataScopeInterceptor } from 'src/common/interceptors/data-scope.interceptor';
import { RepeatSubmitGuard } from 'src/common/guards/repeat-submit.guard';
import { ApiExceptionFilter } from 'src/common/filters/all-exception.filter';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LOGGER_MODULE_OPTIONS } from './logger/logger.constants';
import { LoggerModule } from './logger/logger.module';

@Global()
@Module({
  imports: [
    /* 连接mysql数据库 */
    TypeOrmModule.forRootAsync({
      useFactory: (
        configService: ConfigService,
        loggerOptions: LoggerModuleOptions,
      ) => ({
        autoLoadEntities: true,
        type: configService.get<any>('database.type'),
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.database'),
        autoLoadModels: configService.get<boolean>('database.autoLoadModels'),
        synchronize: configService.get<boolean>('database.synchronize'),
        // logging: configService.get('database.logging'),
        logger: new TypeORMLoggerService(
          configService.get('database.logging'),
          loggerOptions,
        ),
      }),
      inject: [ConfigService, LOGGER_MODULE_OPTIONS],
    }),

    /* 连接redis */
    RedisModule.forRootAsync({
      useFactory: (configService: ConfigService) =>
        configService.get<any>('redis'),
      inject: [ConfigService],
    }),

    /* 启用队列 */
    BullModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get<string>('bullRedis.host'),
          port: configService.get<number>('bullRedis.port'),
          password: configService.get<string>('bullRedis.password'),
        },
      }),
      inject: [ConfigService],
    }),
    /**
     * WinstonLog 模块
     */
    LoggerModule.forRootAsync(
      {
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => {
          return {
            level: configService.get<WinstonLogLevel>('logger.level'),
            consoleLevel: configService.get<WinstonLogLevel>(
              'logger.consoleLevel',
            ),
            timestamp: configService.get<boolean>('logger.timestamp'),
            maxFiles: configService.get<string>('logger.maxFiles'),
            maxFileSize: configService.get<string>('logger.maxFileSize'),
            disableConsoleAtProd: configService.get<boolean>(
              'logger.disableConsoleAtProd',
            ),
            dir: configService.get<string>('logger.dir'),
            errorLogName: configService.get<string>('logger.errorLogName'),
            appLogName: configService.get<string>('logger.appLogName'),
          };
        },
        inject: [ConfigService],
      },
      // global module
      true,
    ),

    /* 导入速率限制模块   ttl:单位秒钟， 表示ttl秒内最多只能请求 limit 次， 避免暴力攻击。*/
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 60,
    }),

    /* 导入系统日志模块 */
    LogModule,
  ],
  controllers: [],
  providers: [
    SharedService,

    //全局异常过滤器
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },

    //全局参数校验管道
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // 启用白名单，dto中没有声明的属性自动过滤
        transform: true, // 自动类型转换
      }),
    },

    //速率限制守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },

    //jwt守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },

    // 角色守卫
    {
      provide: APP_GUARD,
      useClass: RoleAuthGuard,
    },

    // 权限守卫
    {
      provide: APP_GUARD,
      useClass: PermissionAuthGuard,
    },
    //阻止连续提交守卫
    {
      provide: APP_GUARD,
      useClass: RepeatSubmitGuard,
    },

    /* 操作日志拦截器 。 注：拦截器中的 handle 从下往上执行（ReponseTransformInterceptor ----> OperationLogInterceptor），返回值值依次传递 */
    {
      provide: APP_INTERCEPTOR,
      useClass: OperationLogInterceptor,
    },
    /* 全局返回值转化拦截器 */
    {
      provide: APP_INTERCEPTOR,
      useClass: ReponseTransformInterceptor,
    },
    /* 数据权限拦截器 */
    {
      provide: APP_INTERCEPTOR,
      useClass: DataScopeInterceptor,
    },
  ],
  exports: [SharedService],
})
export class SharedModule {}
