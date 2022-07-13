import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule, Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { UtilService } from './services/utils.service';
import { HttpModule } from '@nestjs/axios';
import { RedisModule } from './redis/redis.module';
import { RedisService } from './services/redis.service';

const providers = [UtilService, RedisService];

@Global()
@Module({
  imports: [
    // axios
    HttpModule.register({
      timeout: 5000,
      maxRedirects: 5,
    }),
    // jwt
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
      }),
      inject: [ConfigService],
    }),
    // redis cache
    CacheModule.register(),
    RedisModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        host: configService.get<string>('redis.host'),
        port: configService.get<number>('redis.port'),
        password: configService.get<string>('redis.password'),
        db: configService.get<number>('redis.db'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [...providers],
  exports: [HttpModule, CacheModule, JwtModule, ...providers],
})
export class SharedModule {}
