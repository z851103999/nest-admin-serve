import { WSModule } from './modules/ ws/ws.module';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { Module, CacheModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LOGGER_MODULE_OPTIONS } from './shared/logger/logger.constants';
import {
  LoggerModuleOptions,
  WinstonLogLevel,
} from './shared/logger/logger.interface';
import { LoggerModule } from './shared/logger/logger.module';
import configuration from './config/index';
import { redisStore, RedisModuleOptions } from 'cache-manager-ioredis';
import { HttpModule } from '@nestjs/axios';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    // config
    ConfigModule.forRoot({
      cache: true,
      load: [configuration],
      isGlobal: true,
    }),
    // mysql
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return {
          type: 'mysql',
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          keepConnectionAlive: true,
          ...config.get('db.mysql'),
        } as TypeOrmModuleOptions;
      },
    }),
    //cache redis
    CacheModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        store: redisStore,
        ...config.get<RedisModuleOptions>('redis'),
      }),
      inject: [ConfigService],
    }),
    // jwt
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService) => ({
        ...config.get<JwtModuleOptions>('jwt'),
      }),
      inject: [ConfigService],
    }),
    // http
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    // 参考仓库 https://github.com/buqiyuan/nest-admin
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
      true,
    ),
    AdminModule,
    WSModule,
  ],
})
export class AppModule {}
