import * as DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/modules/users/entity/user.entity';
import { Course } from 'src/modules/courses/entity/course.entity';

@Injectable({ scope: Scope.REQUEST })
export class WishlistLoader {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  public readonly batchUsers = new DataLoader<string, User>(
    async (userIds: readonly string[]) => {
      const users = await this.userRepository.find({
        where: { id: In(userIds as string[]) },
      });

      const userMap: Record<string, User> = {};
      users.forEach((u) => (userMap[u.id] = u));

      return userIds.map((id) => userMap[id]);
    },
  );

  public readonly batchCourses = new DataLoader<string, Course>(
    async (courseIds: readonly string[]) => {
      const courses = await this.courseRepository.find({
        where: { id: In(courseIds as string[]) },
      });

      const courseMap: Record<string, Course> = {};
      courses.forEach((c) => (courseMap[c.id] = c));

      return courseIds.map((id) => courseMap[id]);
    },
  );
}
