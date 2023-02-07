import { ApiProperty, OmitType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsNumberString,
} from 'class-validator';
import { Dept } from '../entities/dept.entity';

export class ReqDeptListDto {
  /* 部门名称 */
  @ApiProperty({ description: 'id' })
  @IsOptional()
  @IsNumberString({}, { message: 'id 类型错误，正确是string' })
  deptName?: string;

  /* 状态 */
  @ApiProperty({ description: '状态' })
  @IsOptional()
  @IsString({ message: '类型错误，正确类型是string' })
  status?: string;
}

export class ReqAddDeptDto extends OmitType(Dept, ['deptId'] as const) {
  /* 父部门Id */
  @ApiProperty({ description: '父部门ID', required: true })
  @Type()
  @IsNumber({}, { message: 'parentId 类型错误，正确是number' })
  parentId: number;
}

export class ReqUpdateDept extends Dept {
  /* 父部门Id */
  @ApiProperty({ description: '父部门ID', required: true })
  @Type()
  @IsNumber({}, { message: 'parentId 类型错误，正确是number' })
  parentId: number;
}
