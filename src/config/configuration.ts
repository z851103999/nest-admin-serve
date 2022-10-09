import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';

export const getConfiguration = () =>
  ({
    rootRoleId: parseInt(process.env.ROOT_ROLE_ID || '1'),
    // jwt
    jwt: {
      secret: process.env.JWT_SECRET || '123456',
    },
    // typeorm config
    database: {
      type: 'mysql',
      host: process.env.MYSQL_HOST,
      port: Number.parseInt(process.env.MYSQL_PORT, 10),
      username: process.env.MYSQL_USERNAME,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [__dirname + '/../**/entities/*.entity.{ts,js}'],
      autoLoadEntities: true,
      synchronize: false,
      logging: ['error'],
      timezone: '+08:00', // 东八区
    } as MysqlConnectionOptions,
    // redis
    redis: {
      host: process.env.REDIS_HOST, // default value
      port: parseInt(process.env.REDIS_PORT, 10), // default value
      password: process.env.REDIS_PASSWORD,
      db: process.env.REDIS_DB,
    },
    // logger config
    logger: {
      timestamp: false,
      dir: process.env.LOGGER_DIR,
      maxFileSize: process.env.LOGGER_MAX_SIZE,
      maxFiles: process.env.LOGGER_MAX_FILES,
      errorLogName: process.env.LOGGER_ERROR_FILENAME,
      appLogName: process.env.LOGGER_APP_FILENAME,
    },
    // swagger
    swagger: {
      enable: process.env.SWAGGER_ENABLE === 'true',
      path: process.env.SWAGGER_PATH,
      title: process.env.SWAGGER_TITLE,
      desc: process.env.SWAGGER_DESC,
      version: process.env.SWAGGER_VERSION,
    },
  } as const);

export type ConfigurationType = ReturnType<typeof getConfiguration>;

export type ConfigurationKeyPaths = Record<NestedKeyOf<ConfigurationType>, any>;
