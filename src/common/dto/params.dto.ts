import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import dayjs from 'dayjs';

export class ParamsDto {
  /* 开始日期 */
  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'params[beginTime]',
    default: dayjs().format('YYYY-MM-DD'),
  })
  beginTime?: string;

  /* 结束日期 */
  @IsOptional()
  @IsString()
  @ApiProperty({
    name: 'params[endTime]',
    default: dayjs().format('YYYY-MM-DD'),
  })
  endTime?: string;
}
