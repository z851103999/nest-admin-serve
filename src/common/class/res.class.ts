import { ApiProperty } from '@nestjs/swagger';

export class ResOp {
  readonly data: any;
  readonly code: number;
  readonly message: string;

  constructor(code: number, data?: any, message = 'success') {
    this.code = code;
    this.data = data;
    this.message = message;
  }

  static success(data?: any) {
    return new ResOp(200, data);
  }
}

/**
 * 分页
 */
export class Pagination {
  total: number;
  page: number;
  size: number;
}

/**
 * 页面结果
 */
export class PageResult<T> {
  list?: Array<T>;
  pagination: Pagination;
}
/**
 * 分页相应DTO
 */
export class PaginatedResponseDto<T> {
  list: Array<T>;
  @ApiProperty()
  pagination: Pagination;
}
