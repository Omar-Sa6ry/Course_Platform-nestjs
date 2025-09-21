import * as DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entity/user.entity';

@Injectable({ scope: Scope.REQUEST })
export class UserLoader {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public readonly batchUsers = new DataLoader<string, User>(
    async (userIds: string[]) => {
      const users = await this.userRepository.findByIds(userIds);
      const userMap = new Map(users.map((u) => [u.id, u]));
      return userIds.map((id) => userMap.get(id));
    },
  );
}
