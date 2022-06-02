import { ApiProperty } from '@nestjs/swagger';
import SysDepartments from '../../../../entities/admin/sys-department.entity';

export class DeptDetailInfo {
  @ApiProperty({ description: '当前查询的部门' })
  department?: SysDepartments;

  @ApiProperty({ description: '所属父级部门' })
  parentDepartment?: SysDepartments;
}
