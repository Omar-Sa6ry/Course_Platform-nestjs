import { RedisService } from 'src/common/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Course } from './entity/course.entity';
import { Repository } from 'typeorm';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { FindCourseInput } from './inputs/findCourse.input';
import { CreateCourseInput } from './inputs/createCourse.input';
import { UpdateCourseInput } from './inputs/updateCourse.input';
import { CourseProxy } from './proxy/course.proxy';
import { CourseFascade } from './fascade/course.fascade';
import {
  CourseCountResponse,
  CourseResponse,
  CoursesResponse,
} from './dto/courseResponse.dto';

@Injectable()
export class CourseService {
  constructor(
    private readonly redisService: RedisService,
    private readonly courseProxy: CourseProxy,
    private readonly courseFascade: CourseFascade,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async create(createCourseInput: CreateCourseInput): Promise<CourseResponse> {
    return await this.courseFascade.create(createCourseInput);
  }

  async update(updateCourseInput: UpdateCourseInput): Promise<CourseResponse> {
    return await this.courseFascade.update(updateCourseInput);
  }

  async delete(id: string): Promise<CourseResponse> {
    return await this.courseFascade.remove(id);
  }

  async findById(id: string): Promise<CourseResponse> {
    return await this.courseProxy.findById(id);
  }

  async findByTitle(title: string): Promise<CourseResponse> {
    return await this.courseProxy.findByTitle(title);
  }

  async findAll(
    findCourseInput: FindCourseInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<CoursesResponse> {
    return await this.courseProxy.findAll(findCourseInput, page, limit);
  }

  async findAllWithoutPag(
    findCourseInput: FindCourseInput,
  ): Promise<CoursesResponse> {
    return await this.courseProxy.findAllWithoutPag(findCourseInput);
  }

  async countCourses(): Promise<CourseCountResponse> {
    const courses = await this.courseRepository.countBy({ isActive: true });

    this.redisService.set(`course_count:true`, courses);
    return { data: courses };
  }

  async countAllCourses(): Promise<CourseCountResponse> {
    const courses = await this.courseRepository.count();

    this.redisService.set(`course_count:all`, courses);
    return { data: courses };
  }
}
