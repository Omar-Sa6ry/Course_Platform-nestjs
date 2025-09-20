import { FindCourseInput } from './../inputs/findCourse.input';
import { RedisService } from 'src/common/redis/redis.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { Course } from '../entity/course.entity';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { CourseResponse, CoursesResponse } from '../dto/courseResponse.dto';
import {
  CourseExistsByTitleHandler,
  CourseExistsHandler,
} from '../chain/course.chain';

@Injectable()
export class CourseProxy {
  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async findById(id: string): Promise<CourseResponse> {
    const cacheKey = `course:${id}`;
    const cachedUser = await this.redisService.get(cacheKey);

    if (cachedUser) return { data: cachedUser as Course };

    const course = await this.courseRepository.findOne({
      where: { id },
      relations: ['instructor', 'category'],
    });

    const existsHandler = new CourseExistsHandler(id);
    await existsHandler.handle(course, this.i18n);

    this.redisService.set(cacheKey, course);

    return { data: course };
  }

  async findByTitle(title: string): Promise<CourseResponse> {
    const course = await this.courseRepository.findOne({
      where: { title: Like(`%${title}%`) },
      relations: {
        instructor: true,
        category: true,
      },
    });

    const existsHandler = new CourseExistsByTitleHandler(title);
    await existsHandler.handle(course, this.i18n);

    this.redisService.set(`course:${course.id}`, course);

    return { data: course };
  }

  async findAll(
    findCourseInput: FindCourseInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<CoursesResponse> {
    const qb = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .orderBy('course.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (findCourseInput.title) {
      qb.andWhere('course.title LIKE :title', {
        title: `%${findCourseInput.title}%`,
      });
    }

    if (findCourseInput.subtitle) {
      qb.andWhere('course.subtitle LIKE :subtitle', {
        subtitle: `%${findCourseInput.subtitle}%`,
      });
    }

  Object.entries(findCourseInput).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      !['title', 'subtitle'].includes(key)
    ) {
      qb.andWhere(`course.${key} = :${key}`, { [key]: value });
    }
  });

    const courses = await qb.getMany();

    if (courses.length === 0) {
      throw new NotFoundException(await this.i18n.t('course.NOT_FOUNDS'));
    }

    return {
      items: courses,
      pagination: {
        currentPage: page,
        totalItems: await qb.getCount(),
        totalPages: Math.ceil((await qb.getCount()) / limit),
      },
    };
  }

  async findAllWithoutPag(
    findCourseInput: FindCourseInput,
  ): Promise<CoursesResponse> {
    const qb = this.courseRepository
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.instructor', 'instructor')
      .leftJoinAndSelect('course.category', 'category')
      .orderBy('course.createdAt', 'DESC');

    if (findCourseInput.title) {
      qb.andWhere('course.title LIKE :title', {
        title: `%${findCourseInput.title}%`,
      });
    }

    if (findCourseInput.subtitle) {
      qb.andWhere('course.subtitle LIKE :subtitle', {
        subtitle: `%${findCourseInput.subtitle}%`,
      });
    }

     Object.entries(findCourseInput).forEach(([key, value]) => {
       if (
         value !== undefined &&
         value !== null &&
         !['title', 'subtitle'].includes(key)
       ) {
         qb.andWhere(`course.${key} = :${key}`, { [key]: value });
       }
     });

    const courses = await qb.getMany();

    if (courses.length === 0) {
      throw new NotFoundException(await this.i18n.t('course.NOT_FOUNDS'));
    }

    return { items: courses };
  }
}
