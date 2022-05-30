import { ConfigService } from '@nestjs/config';
import { LoggerService } from './shared/logger/logger.service';
import { NestFactory, Reflector } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import {
  flatten,
  HttpStatus,
  Logger,
  UnprocessableEntityException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ApiExceptionFilter } from './common/filters/api-exception.filter';
import { ApiTransformInterceptor } from './common/interceptors/api-transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    {
      bufferLogs: true,
    },
  );
  // 启动跨域 cors
  app.enableCors();
  // logger
  app.useLogger(app.get(LoggerService));
  // 全局管道
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      // code 422
      errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
      exceptionFactory: (errors: ValidationError[]) => {
        return new UnprocessableEntityException(
          flatten(
            errors
              .filter((item) => !!item.constraints)
              .map((item) => Object.values(item.constraints)),
          ).join('; '),
        );
      },
    }),
  );
  // 全局过滤器
  app.useGlobalFilters(new ApiExceptionFilter(app.get(LoggerService)));
  // 全局拦截器
  app.useGlobalInterceptors(new ApiTransformInterceptor(new Reflector()));

  const config = app.get(ConfigService);

  const PORT = config.get<number>(`app.port`) || 8080;
  const WS_PORT = config.get<number>(`app.port`) || 8081;
  const WS_PATH = config.get<string>(`app.path`) || `/ws-api`;
  const DOCS_PREFIX = config.get<string>(`app.prefix`) || `swagger-api`;

  await app.listen(PORT, '0.0.0.0', () => {
    Logger.log(`api服务已经启动,请访问:http://localhost:${PORT}`);
    Logger.log(`ws服务已经启动,请访问:http://localhost:${WS_PORT}${WS_PATH}`);
    Logger.log(`API文档已生成,请访问:http://localhost:${PORT}/${DOCS_PREFIX}/`);
  });
}
bootstrap();
