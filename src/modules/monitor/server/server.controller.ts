/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ServerService } from './server.service';

@ApiTags('服务监控')
@Controller('monitor')
export class ServerController {
  constructor(private readonly serverService: ServerService) {}

  /* 获取监控数据 */
  @Get('server')
  async data() {
    const cpu = this.serverService.getCpu();
    const mem = this.serverService.getMem();
    const sys = this.serverService.getSys();
    const sysFiles = this.serverService.getSysFiles();
    const promiseArr = await Promise.all([cpu, mem, sys, sysFiles]);
    return {
      cpu: promiseArr[0],
      mem: promiseArr[1],
      sys: promiseArr[2],
      sysFiles: promiseArr[3],
    };
  }
}
