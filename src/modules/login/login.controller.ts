import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Headers,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  ApiDataResponse,
  typeEnum,
} from 'src/common/decorators/api-data-response.decorator';
import { Public } from 'src/common/decorators/public.decorator';
import { User, UserEnum } from 'src/common/decorators/user.decorator';
import { LocalAuthGuard } from 'src/common/guards/local-auth.guard';
import { Router } from '../system/menu/dto/res-menu.dto';
import { ReqLoginDto } from './dto/req-login.dto';
import { ResImageCaptchaDto, ResLoginDto } from './dto/res-login.dto';
import { LoginService } from './login.service';
import { Request } from 'express';
import { ImageCaptcha, LoginToken } from './class/login.class';

@ApiTags('登录')
@Controller()
export class LoginController {
  constructor(private readonly loginService: LoginService) {}

  /* 获取图片验证码 */
  @ApiOperation({ summary: '获取登陆图片验证码' })
  @ApiOkResponse({ type: ImageCaptcha })
  @Get('captchaImage')
  @Public()
  async captchaImage(): Promise<ResImageCaptchaDto> {
    return await this.loginService.createImageCaptcha();
  }

  /* 用户登录 */
  @ApiOperation({ summary: '用户登陆' })
  @ApiOkResponse({ type: LoginToken })
  @Post('login')
  @Public()
  @UseGuards(LocalAuthGuard)
  async login(
    @Body() reqLoginDto: ReqLoginDto,
    @Req() req: Request,
  ): Promise<ResLoginDto> {
    return await this.loginService.login(req);
  }

  /* 获取用户信息 */
  @ApiOperation({ summary: '获取用户信息' })
  @Get('getInfo')
  async getInfo(@User(UserEnum.userId) userId: number) {
    return await this.loginService.getInfo(userId);
  }

  /* 获取用户路由信息 */
  @ApiOperation({ summary: '获取用户路由信息' })
  @Get('getRouters')
  @ApiDataResponse(typeEnum.objectArr, Router)
  async getRouters(@User(UserEnum.userId) userId: number) {
    return await this.loginService.getRouterByUser(userId);
  }

  /* 退出登录 */
  @ApiOperation({ summary: '退出登录' })
  @Public()
  @Post('logout')
  async logout(@Headers('Authorization') authorization: string) {
    if (authorization) {
      const token = authorization.slice(7);
      await this.loginService.logout(token);
    }
  }
}
