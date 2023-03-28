import { Injectable } from '@nestjs/common';
import { Logger, LoggerOptions } from 'typeorm';
import {
  DEFAULT_SQL_ERROR_LOG_NAME,
  DEFAULT_SQL_SLOW_LOG_NAME,
} from './logger.constants';
import { LoggerModuleOptions } from './logger.interface';
import { LoggerService } from './logger.service';

/**
 * 自定义TypeORM日志，sqlSlow日志及error日志会自动记录至日志文件
 */
@Injectable()
export class TypeORMLoggerService implements Logger {
  /**
   * sql logger
   */
  private logger: LoggerService;

  constructor(
    private options: LoggerOptions,
    private config: LoggerModuleOptions,
  ) {
    this.logger = new LoggerService(TypeORMLoggerService.name, {
      level: 'warn',
      consoleLevel: 'verbose',
      appLogName: DEFAULT_SQL_SLOW_LOG_NAME,
      errorLogName: DEFAULT_SQL_ERROR_LOG_NAME,
      timestamp: this.config.timestamp,
      dir: this.config.dir,
      maxFileSize: this.config.maxFileSize,
      maxFiles: this.config.maxFiles,
    });
  }

  /**
   * 记录查询和其中使用的参数。
   */
  logQuery(query: string, parameters?: any[]) {
    if (
      this.options === 'all' ||
      this.options === true ||
      (Array.isArray(this.options) && this.options.indexOf('query') !== -1)
    ) {
      const sql =
        query +
        (parameters && parameters.length
          ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
          : '');
      this.logger.verbose('[QUERY]: ' + sql);
    }
  }

  /**
   * 记录失败的查询。
   */
  logQueryError(error: string | Error, query: string, parameters?: any[]) {
    if (
      this.options === 'all' ||
      this.options === true ||
      (Array.isArray(this.options) && this.options.indexOf('error') !== -1)
    ) {
      const sql =
        query +
        (parameters && parameters.length
          ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
          : '');
      this.logger.error([`[FAILED QUERY]: ${sql}`, `[QUERY ERROR]: ${error}`]);
    }
  }

  /**
   * 记录查询速度较慢
   */
  logQuerySlow(time: number, query: string, parameters?: any[]) {
    const sql =
      query +
      (parameters && parameters.length
        ? ' -- PARAMETERS: ' + this.stringifyParams(parameters)
        : '');
    this.logger.warn(`[SLOW QUERY: ${time} ms]: ` + sql);
  }

  /**
   * 记录架构生成过程中的事件。
   */
  logSchemaBuild(message: string) {
    if (
      this.options === 'all' ||
      (Array.isArray(this.options) && this.options.indexOf('schema') !== -1)
    ) {
      this.logger.verbose(message);
    }
  }

  /**
   * 记录迁移运行过程中的事件。
   */
  logMigration(message: string) {
    this.logger.verbose(message);
  }

  /**
   * 使用给定的记录器执行日志记录，
   * 或默认在控制台上执行日志记录。日志有自己的级别和消息。
   */
  log(level: 'log' | 'info' | 'warn', message: any) {
    switch (level) {
      case 'log':
        if (
          this.options === 'all' ||
          (Array.isArray(this.options) && this.options.indexOf('log') !== -1)
        )
          this.logger.verbose('[LOG]: ' + message);
        break;
      case 'info':
        if (
          this.options === 'all' ||
          (Array.isArray(this.options) && this.options.indexOf('info') !== -1)
        )
          this.logger.log('[INFO]: ' + message);
        break;
      case 'warn':
        if (
          this.options === 'all' ||
          (Array.isArray(this.options) && this.options.indexOf('warn') !== -1)
        )
          this.logger.warn('[WARN]: ' + message);
        break;
    }
  }

  /**
   * 将参数转换为字符串。有时参数可以有原型对象，因此我们也处理这种情况。
   */
  protected stringifyParams(parameters: any[]) {
    try {
      return JSON.stringify(parameters);
    } catch (error) {
      // most probably circular objects in parameters
      return parameters;
    }
  }
}
