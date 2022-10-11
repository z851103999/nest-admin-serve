import { ApiException } from 'src/common/exceptions/api.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import SysConfig from 'src/entities/admin/sys-config.entity';
import { Repository } from 'typeorm';
import { CreateParamConfigDto, UpdateParamConfigDto } from './param-config.dto';

@Injectable()
export class SysParamConfigService {
  constructor(
    @InjectRepository(SysConfig)
    private configRepository: Repository<SysConfig>,
  ) {}

  /**
   * 罗列所有配置
   * @param page
   * @param count
   * @returns
   */
  async getConfigListByPage(page: number, count: number): Promise<SysConfig[]> {
    return this.configRepository.find({
      order: {
        id: 'ASC',
      },
      take: count,
      skip: page * count,
    });
  }
  /**
   * 获取参数总数
   * @returns
   */
  async countConfigList(): Promise<number> {
    return this.configRepository.count();
  }

  /**
   * 添加
   * @param dto
   */
  async add(dto: CreateParamConfigDto): Promise<void> {
    await this.configRepository.insert(dto);
  }
  /**
   * 更新
   * @param dto
   */
  async update(dto: UpdateParamConfigDto): Promise<void> {
    await this.configRepository.update(
      { id: dto.id },
      { name: dto.name, value: dto.value, remark: dto.remark },
    );
  }
  /**
   * 删除
   * @param ids
   */
  async delete(ids: number[]): Promise<void> {
    await this.configRepository.delete(ids);
  }

  /**
   * 查找
   * @param id
   * @returns
   */
  async findOne(id: number): Promise<SysConfig> {
    return await this.configRepository.findOneBy({ id });
  }
  /**
   * 参数配置键值对已存在
   * @param key
   */
  async isExistKey(key: string): Promise<void | never> {
    const result = await this.configRepository.findBy({ key });
    if (result) {
      throw new ApiException(10021);
    }
  }
  /**
   * 按键查找值;
   * @param key
   * @returns
   */
  async findValueByKey(key: string): Promise<string | null> {
    const result = await this.configRepository.find({
      where: { key },
      select: ['value'],
    });
    if (result) {
      return result['value'];
    }
    return null;
  }
}
