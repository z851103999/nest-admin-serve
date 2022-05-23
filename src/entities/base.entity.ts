import { CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
  @CreateDateColumn({ name: 'create_at' })
  @ApiProperty()
  createAt: Date;

  @UpdateDateColumn({ name: 'update_at' })
  @ApiProperty()
  updateAt: Date;

  @DeleteDateColumn({ name: 'delete_at' })
  @ApiProperty()
  delete_at: Date;
}
