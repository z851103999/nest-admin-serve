import { Injectable } from '@nestjs/common';
import SysUser from '../../../../entities/admin/sys-user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import SysDepartments from 'src/entities/admin/sys-department.entity';
import SysUserRole from '../../../../entities/admin/sys-user-role.entity';
import { RedisService } from '../../../../shared/services/redis.service';
import { isEmpty } from 'lodash';
import { ApiException } from 'src/common/exceptions/api.exception';
import { UpdatePasswordDto, UpdateUserInfoDto } from './user.dto';
import { UtilService } from '../../../../shared/services/utils.service';
// import { SysParamConfigService } from '../param-config/param-config.service';

@Injectable()
export class SysUserService {
  constructor(
    @InjectRepository(SysUser)
    private userRepository: Repository<SysUser>,
    @InjectRepository(SysDepartments)
    private departmentRepository: Repository<SysDepartments>,
    @InjectRepository(SysUserRole)
    private userRoleRepository: Repository<SysUserRole>,
    private redisService: RedisService,
    // private paramConfigService: SysParamConfigService,
    private util: UtilService,
  ) {}

  /**
   * 根据用户名查找以启用的用户
   * @param username
   */
  async findUserByUserName(username: string): Promise<SysUser | undefined> {
    return await this.userRepository.findOne({
      username: username,
      status: 1,
    });
  }

  /**
   * 根据用户名查找已经启用的用户
   * @param uid
   * @param ip
   */
  async getAccountInfo(uid: number, ip?: string): Promise<any> {
    const user: SysUser = await this.userRepository.findOne({ id: uid });
    if (isEmpty(user)) {
      throw new ApiException(10017);
    }
    return {
      name: user.name,
      nickName: user.nickName,
      email: user.email,
      remark: user.remark,
      headImg: user.headImg,
      loginIP: ip,
    };
  }

  /**
   * 更新个人信息
   * @param uid
   * @param info
   */
  async updatePersonInfo(uid: number, info: UpdateUserInfoDto): Promise<void> {
    await this.userRepository.update(uid, info);
  }

  /**
   * 更改管理员密码
   * @param uid
   * @param dto
   */
  async updatePassword(uid: number, dto: UpdatePasswordDto): Promise<void> {
    const user = await this.userRepository.findOne({ id: uid });
    if (isEmpty(user)) {
      throw new ApiException(10017);
    }
    const comparePassword = this.util.md5(`${dto.originPassword}${user.psalt}`);
    // 原密码不一致，不允许更改
    if (user.password !== comparePassword) {
      throw new ApiException(10011);
    }
    const password = this.util.md5(`${dto.newPassword}${user.psalt}`);
    await this.userRepository.update({ id: uid }, { password });
    await this.upgradePasswordV(user.id);
  }

  /**
   * 直接更新管理员密码
   * @param uid
   * @param password
   */
  async forceUpdatePassword(uid: number, password: string): Promise<void> {
    const user = await this.userRepository.findOne({ id: uid });
    if (isEmpty(user)) {
      throw new ApiException(10017);
    }
    const newPassword = this.util.md5(`${password}${user.psalt}`);
    await this.userRepository.update({ id: uid }, { password: newPassword });
    await this.upgradePasswordV(user.id);
  }

  /**
   * 升级用户版本密码
   * @param id
   */
  async upgradePasswordV(id: number): Promise<void> {
    const v = await this.redisService
      .getRedis()
      .get(`admin:passwordVersion:${id}`);
    if (!isEmpty(v)) {
      await this.redisService
        .getRedis()
        .set(`admin:passwordVersion:${id}`, parseInt(v) + 1);
    }
  }
}
