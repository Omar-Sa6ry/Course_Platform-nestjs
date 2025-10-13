import {
  UserCountResponse,
  UserResponse,
  UsersResponse,
} from '../dto/UserResponse.dto';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/modules/users/entity/user.entity';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { Role } from 'src/common/constant/enum.constant';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RedisService } from '@bts-soft/core';

@Injectable()
export class UserProxy {
  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<UserResponse> {
    const cacheKey = `user:${id}`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) return { data: cachedUser as User };

    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));

    this.redisService.set(cacheKey, user);
    this.redisService.set(`user:email:${user.email}`, user);

    return { data: user };
  }

  async findByEmail(email: string): Promise<UserResponse> {
    const cacheKey = `user:email:${email}`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) return { data: cachedUser as User };

    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException(await this.i18n.t('user.NOT_FOUND'));

    this.redisService.set(cacheKey, user);
    this.redisService.set(`user:id:${user.id}`, user);

    return { data: user };
  }

  async findUsers(
    page: number = Page,
    limit: number = Limit,
  ): Promise<UsersResponse> {
    const [items, total] = await this.userRepo.findAndCount({
      where: { role: Role.USER },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    if (items.length === 0)
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUNDS'));

    return {
      items,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findInstructors(
    page: number = Page,
    limit: number = Limit,
  ): Promise<UsersResponse> {
    const [items, total] = await this.userRepo.findAndCount({
      where: { role: Role.INSTRUCTOR },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });
    if (items.length === 0)
      throw new NotFoundException(await this.i18n.t('user.NOT_FOUNDS'));

    return {
      items,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async phonenumberChecks(phone?: string, whatsapp?: string) {
    if (phone) {
      const phoneExised = await this.userRepo.findOne({ where: { phone } });
      if (phoneExised)
        throw new BadRequestException(await this.i18n.t('user.PHONE_EXISTED'));
    }

    if (whatsapp) {
      const whatsappExised = await this.userRepo.findOne({
        where: { whatsapp },
      });
      if (whatsappExised)
        throw new BadRequestException(
          await this.i18n.t('user.WHTSAPP_EXISTED'),
        );
    }
  }

  async dataExisted(
    email: string,
    phone: string,
    whatsapp: string,
    nationalId: string,
  ): Promise<void> {
    const cacheKey = `user:email:${email}`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser)
      throw new BadRequestException(await this.i18n.t('user.EMAIL_EXISTED'));

    const [emailExised, phoneExised, whatsappExised, nationalIdExised] =
      await Promise.all([
        this.userRepo.findOne({ where: { email } }),
        this.userRepo.findOne({ where: { phone } }),
        this.userRepo.findOne({ where: { whatsapp } }),
        this.userRepo.findOne({ where: { nationalId } }),
      ]);

    if (emailExised)
      throw new BadRequestException(await this.i18n.t('user.EMAIL_EXISTED'));

    if (phoneExised)
      throw new BadRequestException(await this.i18n.t('user.PHONE_EXISTED'));

    if (whatsappExised)
      throw new BadRequestException(await this.i18n.t('user.WHTSAPP_EXISTED'));

    if (nationalIdExised)
      throw new BadRequestException(
        await this.i18n.t('user.NATIONALID_EXISTED'),
      );
  }

  // counts
  async getUsersCount(): Promise<UserCountResponse> {
    const cacheKey = `user-count`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) return { data: cachedUser };

    const count = {
      data: await this.userRepo.count({ where: { role: Role.USER } }),
    };

    this.redisService.set(cacheKey, count.data);
    return count;
  }

  async getInstructorsCout(): Promise<UserCountResponse> {
    const cacheKey = `instructor-count`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) return { data: cachedUser };

    const count = {
      data: await this.userRepo.countBy({ role: Role.INSTRUCTOR }),
    };

    this.redisService.set(cacheKey, count.data);
    return count;
  }

  async coutActiveInstructors(): Promise<UserCountResponse> {
    const cacheKey = `active-instructor-count`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) return { data: cachedUser };

    const count = {
      data: await this.userRepo.countBy({
        role: Role.INSTRUCTOR,
        isActive: true,
      }),
    };

    this.redisService.set(cacheKey, count.data);
    return count;
  }

  async coutActiveUsers(): Promise<UserCountResponse> {
    const cacheKey = `active-user-count`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) return { data: cachedUser };

    const count = {
      data: await this.userRepo.countBy({
        role: Role.USER,
        isActive: true,
      }),
    };

    this.redisService.set(cacheKey, count.data);
    return count;
  }

  async coutunActiveUsers(): Promise<UserCountResponse> {
    const cacheKey = `unactive-user-count`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) return { data: cachedUser };

    const count = {
      data: await this.userRepo.countBy({
        role: Role.USER,
        isActive: true,
      }),
    };

    this.redisService.set(cacheKey, count.data);
    return count;
  }

  async unAcutActiveInstructors(): Promise<UserCountResponse> {
    const cacheKey = `unactive-instructor-count`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) return { data: cachedUser };

    const count = {
      data: await this.userRepo.countBy({
        role: Role.INSTRUCTOR,
        isActive: false,
      }),
    };

    this.redisService.set(cacheKey, count.data);
    return count;
  }

  async averageStudentsToInstructor(): Promise<UserCountResponse> {
    const cacheKey = `averageStudentsToInstructor`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) return { data: cachedUser };

    const count = {
      data:
        +(await this.getUsersCount())?.data /
        +(await this.getInstructorsCout())?.data,
    };

    this.redisService.set(cacheKey, count.data);
    return count;
  }

  async createInstructor(userId: string): Promise<UserResponse> {
    const user = (await this.findById(userId))?.data;

    if (user.role !== Role.USER)
      throw new BadRequestException(await this.i18n.t('user.NOT_USER'));

    await this.userRepo.update({ id: userId }, { role: Role.INSTRUCTOR });

    const cachedUser = await this.redisService.get(`unactive-instructor-count`);
    if (cachedUser)
      this.redisService.set(`unactive-instructor-count`, +cachedUser + 1);

    return { data: user };
  }

  // For Anthor Serices
  async checkIfInstractor(id: string): Promise<Boolean> {
    const user = (await this.findById(id))?.data;

    if (user.role !== Role.INSTRUCTOR)
      throw new BadRequestException(await this.i18n.t('user.NOT_INSTRACTOR'));

    return true;
  }

  async makeUserActive(id: string): Promise<void> {
    (await this.findById(id))?.data;
    await this.userRepo.update({ id }, { isActive: true });
  }
}
