import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function setupSwagger(app: INestApplication): void {
  const swaggerConfig = new DocumentBuilder()
    .setTitle('admin')
    .setDescription('Api文档')
    .setVersion('1.0')
    .setTermsOfService('https://docs.nestjs.cn/')
    .setLicense('MIT', '')
    .addBearerAuth()
    // .addTag('admin')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(`swagger-ui`, app, document);
}
