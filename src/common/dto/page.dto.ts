import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class PageOptionsDto {
  @ApiProperty({
    description: '当前页包含包含的数量',
    required: false,
    default: 10,
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly limit: number = 10;

  @ApiProperty({ description: '当前页包含数量', required: false, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly page: number = 1;
}
