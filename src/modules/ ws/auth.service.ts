import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import { isEmpty } from 'lodash';
import { IAdminUser } from '../admin/admin.interface';
import { SocketException } from '../../common/exceptions/socket.exception';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}
  // 检查管理员token
  checkAdminAuthToken(
    token: string | string[] | undefined,
  ): IAdminUser | never {
    if (isEmpty(token)) {
      throw new SocketException(11001);
    }
    try {
      return this.jwtService.verify(Array.isArray(token) ? token[0] : token);
    } catch (e) {
      throw new SocketException(11001);
    }
  }
}
