import { UserProxy } from 'src/modules/users/proxy/user.proxy';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RedisService } from 'src/common/redis/redis.service';
import { UserResponse, UsersResponse } from './dto/UserResponse.dto';
import { IUserObserver } from './interfaces/IUserObserver.interface';
import { CacheObserver } from './observer/user.observer';
import { User } from './entity/user.entity';
import { Limit, Page } from 'src/common/constant/messages.constant';

@Injectable()
export class UserService {
  private observers: IUserObserver[] = [];

  constructor(
    private readonly redisService: RedisService,
    private readonly proxy: UserProxy,
    @InjectRepository(User) private readonly userRepo: Repository<User>,
  ) {
    this.observers.push(new CacheObserver(this.redisService));
  }

  async findById(id: string): Promise<UserResponse> {
    return this.proxy.findById(id);
  }

  async findByEmail(email: string): Promise<UserResponse> {
    return this.proxy.findByEmail(email);
  }

  async findUsers(
    page: number = Page,
    limit: number = Limit,
  ): Promise<UsersResponse> {
    return this.proxy.findUsers(page, limit);
  }
}
