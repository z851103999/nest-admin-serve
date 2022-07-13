import { LoggerOptions } from 'typeorm';
import { LoggerModuleOptions as LoggerConfigOptions } from 'src/shared/logger/logger.interface';

/**
 * 默认 配置智能提示
 * @param config
 * @returns
 */
export function defineConfig(config: IConfig): IConfig {
  return config;
}

export interface IConfig {
  /**
   * 管理员角色ID，一旦分配，该角色下分配的管理员都为超级管理员
   */
  rootRole?: number;
  /**
   * 用户鉴权Token密钥
   */
  jwt?: JwtConfigOptions;
  /**
   * Mysql数据库配置
   */
  database?: DataBaseConfigOptions;
  /**
   * Redis配置 缓存配置
   */
  redis?: RedisConfigOptions;
  /**
   * 应用级别日志配置
   */
  logger?: LoggerConfigOptions;
  /**
   * Swagger文档配置
   */
  swagger?: SwaggerConfigOptions;
}

export interface RedisConfigOptions {
  host?: string;
  port?: number | string;
  password: string;
  db?: number;
}

export interface JwtConfigOptions {
  secret: string;
}

export interface DataBaseConfigOptions {
  type?: string;
  host?: string;
  port?: number | string;
  username?: string;
  password?: string;
  database?: string;
  synchronize?: boolean;
  logging?: LoggerOptions;
}

export interface SwaggerConfigOptions {
  enable?: boolean;
  path?: string;
  title?: string;
  desc?: string;
  version?: string;
}
