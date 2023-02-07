import { TreeDataDto } from 'src/common/dto/tree-data.dto';
import { IsArray, Validate } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResRoleDeptTreeselectDto {
  /* 选中的菜单id数组 */
  @ApiProperty({ description: '选中的菜单id数组', required: true })
  @IsArray({ message: 'checkedKeys 类型错误，正确类型 Array' })
  checkedKeys: number[];

  /* 菜单列表 */
  @ApiProperty({ description: '菜单列表', required: true })
  @Validate(TreeDataDto, {
    message: 'depts 类型错误，正确类型TreeDataDto[]',
  })
  depts: TreeDataDto[];
}
