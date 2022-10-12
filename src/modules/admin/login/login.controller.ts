import {
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Authorize } from '../core/decorators/authorize.decorator';
import { ImageCaptchaDto, LoginInfoDto, RefreshInfoDto } from './login.dto';
import { ImageCaptcha, LoginToken, RefreshToken } from './login.class';
import { LoginService } from './login.service';
import { LogDisabled } from '../core/decorators/log-disabled.decorator';
import { UtilService } from 'src/shared/services/utils.service';

@ApiTags('登录模块')
@Controller()
export class LoginController {
  constructor(private loginService: LoginService, private utils: UtilService) {}

  @ApiOperation({
    summary: '获取登录图片验证码',
  })
  @ApiOkResponse({ type: ImageCaptcha })
  @Get('captcha/img')
  @Authorize()
  async captchaByImg(@Query() dto: ImageCaptchaDto): Promise<ImageCaptcha> {
    return await this.loginService.createImageCaptcha(dto);
  }

  @ApiOperation({
    summary: '管理员登录',
  })
  @ApiOkResponse({ type: LoginToken })
  @Post('login')
  @LogDisabled()
  @Authorize()
  async login(
    @Body() dto: LoginInfoDto,
    @Req() req: FastifyRequest,
    @Headers('user-agent') ua: string,
  ): Promise<any> {
    await this.loginService.checkImgCaptcha(dto.captchaId, dto.verifyCode);
    const token = await this.loginService.getLoginSign(
      dto.username,
      dto.password,
      this.utils.getReqIP(req),
      ua,
    );
    return { token };
  }

  @ApiOperation({ summary: '刷新token' })
  @ApiOkResponse({ type: RefreshToken })
  @Post('refresh')
  @LogDisabled()
  @Authorize()
  async refresh(@Body() dto: RefreshInfoDto): Promise<object> {
    return this.loginService.refreshToken(dto.refreshToken);
  }
}
