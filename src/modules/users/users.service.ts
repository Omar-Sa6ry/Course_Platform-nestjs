import { UserProxy } from 'src/modules/users/proxy/user.proxy';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserCountResponse,
  UserResponse,
  UsersResponse,
} from './dto/UserResponse.dto';
import { IUserObserver } from './interfaces/IUserObserver.interface';
import { CacheObserver } from './observer/user.observer';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { RedisService } from '@bts-soft/core';

@Injectable()
export class UserService {
  private observers: IUserObserver[] = [];

  constructor(
    private readonly redisService: RedisService,
    private readonly proxy: UserProxy,
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

  async getInstructorsCout(): Promise<UserCountResponse> {
    return this.proxy.getInstructorsCout();
  }

  async getUsersCount(): Promise<UserCountResponse> {
    return this.proxy.getUsersCount();
  }

  async coutActiveInstructors(): Promise<UserCountResponse> {
    return this.proxy.coutActiveInstructors();
  }

  async unAcutActiveInstructors(): Promise<UserCountResponse> {
    return this.proxy.unAcutActiveInstructors();
  }

  async coutActiveUsers(): Promise<UserCountResponse> {
    return this.proxy.coutActiveUsers();
  }

  async coutunActiveUsers(): Promise<UserCountResponse> {
    return this.proxy.coutunActiveUsers();
  }

  async averageStudentsToInstructor(): Promise<UserCountResponse> {
    return this.proxy.averageStudentsToInstructor();
  }

  async createInstructor(userIdInput: string): Promise<UserResponse> {
    return this.proxy.createInstructor(userIdInput);
  }

  async findInstructors(
    page: number = Page,
    limit: number = Limit,
  ): Promise<UsersResponse> {
    return this.proxy.findInstructors(page, limit);
  }
}
