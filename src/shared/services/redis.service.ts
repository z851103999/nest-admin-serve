import { Cluster, Redis } from 'cache-manager-ioredis';
import {
  REDIS_CLIENT,
  REDIS_DEFAULT_CLIENT_KEY,
} from './../redis/redis.constants';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  constructor(
    @Inject(REDIS_CLIENT)
    private readonly client: Map<string, Redis | Cluster>,
  ) {}
  /**
   * 按名称获取redis
   * @param name
   * @returns
   */
  public getRedis(name = REDIS_DEFAULT_CLIENT_KEY): Redis {
    if (!this.client.has(name)) {
      throw new Error(`redis client ${name} does not exist`);
    }
    return this.client.get(name) as Redis;
  }
}
