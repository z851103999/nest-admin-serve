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
import { setupSwagger } from './shared/swagger/setup-swagger';

const PORT = process.env.PORT;

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
  // swagger
  setupSwagger(app);

  await app.listen(PORT, '0.0.0.0', () => {
    Logger.log(`api服务已经启动,请访问:http://localhost:${PORT}`);
    Logger.log(
      `ws服务已经启动,请访问:http://localhost:${process.env.WS_PORT}${process.env.WS_PATH}`,
    );
    Logger.log(
      `API文档已生成,请访问:http://localhost:${PORT}/${process.env.DOCS_PREFIX}/`,
    );
  });
}
bootstrap();
