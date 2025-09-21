import * as DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Request } from '../entity/request.entity';
import { Course } from 'src/modules/courses/entity/course.entity';
import { RequestStatus } from 'src/common/constant/enum.constant';

@Injectable({ scope: Scope.REQUEST })
export class CourseLoaderForUser {
  constructor(
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {}

  public readonly batchCoursesForUsers = new DataLoader<string, Course[]>(
    async (userIds: readonly string[]) => {
      const requests = await this.requestRepository.find({
        where: {
          userId: In(userIds as string[]),
          status: RequestStatus.APPROVED,
        },
        relations: ['course', 'course.category', 'course.instructor'],
      });

      const coursesMap: Record<string, Course[]> = {};
      userIds.forEach((id) => (coursesMap[id] = []));

      requests.forEach((req) => {
        if (req.userId && req.course) {
          coursesMap[req.userId].push(req.course);
        }
      });

      return userIds.map((id) => coursesMap[id] || []);
    },
  );
}
