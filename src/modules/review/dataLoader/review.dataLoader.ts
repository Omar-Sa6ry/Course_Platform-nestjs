import * as DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { Course } from '../../courses/entity/course.entity';
import { User } from '../../users/entity/user.entity';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable({ scope: Scope.REQUEST })
export class ReviewLoaders {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  readonly batchCourses = new DataLoader<string, Course>(
    async (courseIds: string[]) => {
      const courses = await this.courseRepository.findBy({
        id: In(courseIds),
      });
      const courseMap = new Map(courses.map((c) => [c.id, c]));
      return courseIds.map((id) => courseMap.get(id));
    },
  );

  readonly batchStudents = new DataLoader<string, User>(
    async (studentIds: string[]) => {
      const users = await this.userRepository.findBy({
        id: In(studentIds),
      });
      const userMap = new Map(users.map((u) => [u.id, u]));
      return studentIds.map((id) => userMap.get(id));
    },
  );
}
