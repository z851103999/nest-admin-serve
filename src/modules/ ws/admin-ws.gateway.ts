import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketServer,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from './auth.service';
import { EVENT_OFFLINE } from './ws.event';

/**
 * Admin WebSocket 网关，不含权限校验，Socket端只做通知相关操作
 */
@WebSocketGateway(parseInt(process.env.WS_PORT), {
  path: process.env.WS_PATH,
  namespace: '/admin',
})
export class AdminWSGateway
  implements OnGatewayInit, OnGatewayDisconnect, OnGatewayConnection
{
  @WebSocketServer()
  private wss: Server;

  get socketServer(): Server {
    return this.wss;
  }

  constructor(private authService: AuthService) {}

  /**
   * 网关初始化
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  afterInit() {}

  /**
   * 网关连接
   */
  async handleConnection(client: Socket): Promise<void> {
    try {
      this.authService.checkAdminAuthToken(client.handshake?.query?.token);
    } catch (e) {
      client.disconnect();
      return;
    }
  }

  /**
   * 网关断开
   * @param client
   */
  async handleDisconnect(client: Socket): Promise<void> {
    client.broadcast.emit(EVENT_OFFLINE);
  }
}
