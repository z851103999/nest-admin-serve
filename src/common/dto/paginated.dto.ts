import { ApiHideProperty } from '@nestjs/swagger';

/**
 *  分页响应参数
 */
export class PaginatedDto<T> {
  /* 总条数 */
  total: number;

  @ApiHideProperty()
  rows: T[];
}
