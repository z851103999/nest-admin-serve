import { AllExceptionsFilter } from 'src/common/filters/all-exception.filter';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { setupSwagger } from './setup-swagger';
import history from 'connect-history-api-fallback';
import helmet from 'helmet';
import compression from 'compression';
import { LoggerService } from './shared/logger/logger.service';
import { Logger } from '@nestjs/common';
import rateLimit from 'express-rate-limit';
// webpack
declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  /* 设置 HTTP 标头来帮助保护应用免受一些众所周知的 Web 漏洞的影响 */
  app.use(
    helmet({
      contentSecurityPolicy: false, //取消https强制转换
    }),
  );

  // winston
  app.useLogger(app.get(LoggerService));

  // global filters
  app.useGlobalFilters(new AllExceptionsFilter(app.get(LoggerService)));

  // gzip
  app.use(compression());

  // cors
  app.enableCors();

  //限速
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );

  /* 启动 vue 的 history模式 */
  app.use(
    history({
      rewrites: [
        {
          from: /^\/swagger-ui\/.*$/,
          to: function (context) {
            return context.parsedUrl.pathname;
          },
        },
      ],
    }),
  );

  /* 配置静态资源目录 */
  app.useStaticAssets(join(__dirname, '../public'));
  /* 配置上传文件目录为 资源目录 */
  if (process.env.uploadPath) {
    app.useStaticAssets(process.env.uploadPath, {
      prefix: '/upload',
    });
  }

  /* 启动swagger */
  setupSwagger(app);

  /* 监听启动端口 */
  await app.listen(3000);

  // webpack打包
  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  /* 打印swagger地址 */
  console.log('http://127.0.0.1:3000/swagger-ui/');
  // 根据操作系统和IP版本返回应用程序正在监听的url。
  const serverUrl = await app.getUrl();
  Logger.log(`api服务已经启动,请访问: ${serverUrl}`);
  Logger.log(`API文档已生成,请访问: ${serverUrl}/swagger-ui/`);
}
bootstrap();
