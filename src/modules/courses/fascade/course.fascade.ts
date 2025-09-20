import { RedisService } from './../../../common/redis/redis.service';
import { UploadService } from 'src/common/upload/upload.service';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { I18nService } from 'nestjs-i18n';
import { Course } from '../entity/course.entity';
import { CourseResponse } from '../dto/courseResponse.dto';
import { CourseProxy } from '../proxy/course.proxy';
import { CourseExistsHandler, CourseTitleHandler } from '../chain/course.chain';
import { CreateCourseInput } from '../inputs/createCourse.input';
import { UpdateCourseStrategy } from '../stratgies/updateCourse.stratgy';
import { CreateCourseStrategy } from '../stratgies/createCourse.stratgy';
import { UpdateCourseInput } from '../inputs/updateCourse.input';
import { DeleteMediaHandler } from '../chain/deleteMedia.chain';

@Injectable()
export class CourseFascade {
  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    private readonly courseProxy: CourseProxy,
    private readonly createStrategy: CreateCourseStrategy,
    private readonly updateStrategy: UpdateCourseStrategy,
    private readonly uploadService: UploadService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  @Transactional()
  async create(createCourseInput: CreateCourseInput): Promise<CourseResponse> {
    const titleHandler = new CourseTitleHandler(
      createCourseInput.title,
      this.courseRepository,
    );
    await titleHandler.handle(null, this.i18n);

    const course = await this.createStrategy.execute(createCourseInput);

    if (course.isActive) {
      const courses = await this.courseRepository.countBy({ isActive: true });
      this.redisService.set(`course_count:all`, courses);
    }

    const allcourses = await this.courseRepository.count();
    this.redisService.set(`course_count:true`, allcourses);

    return {
      data: course,
      statusCode: 201,
      message: await this.i18n.t('course.CREATED'),
    };
  }

  @Transactional()
  async update(updateCourseInput: UpdateCourseInput): Promise<CourseResponse> {
    const course = (await this.courseProxy.findById(updateCourseInput.id))
      ?.data;

    const existsHandler = new CourseExistsHandler(updateCourseInput.id);

    if (updateCourseInput.title) {
      const titleHandler = new CourseTitleHandler(
        updateCourseInput.title,
        this.courseRepository,
      );
      existsHandler.setNext(titleHandler);
    }

    await existsHandler.handle(course, this.i18n);

    const updatedCourse = await this.updateStrategy.execute(updateCourseInput);

    if (updateCourseInput.isActive) {
      const courses = await this.courseRepository.countBy({ isActive: true });
      this.redisService.set(`course_count:all`, courses);
    }
    
    this.redisService.update(`course:${updatedCourse.id}`, updatedCourse);

    return {
      data: updatedCourse,
      message: await this.i18n.t('course.UPDATED', {
        args: { title: updatedCourse.title },
      }),
    };
  }

  @Transactional()
  async remove(id: string): Promise<CourseResponse> {
    const course = await this.courseRepository.findOneBy({ id });

    const existsHandler = new CourseExistsHandler(id);
    const deleteMediaHandler = new DeleteMediaHandler(this.uploadService);

    existsHandler.setNext(deleteMediaHandler);
    await existsHandler.handle(course, this.i18n);

    await this.courseRepository.remove(course!);

    if (course.isActive) {
      const courses = await this.courseRepository.countBy({ isActive: true });
      this.redisService.set(`course_count:all`, courses);
    }

    const allcourses = await this.courseRepository.count();
    this.redisService.set(`course_count:true`, allcourses);
    this.redisService.del(`course:${id}`);

    return {
      data: null,
      message: await this.i18n.t('course.DELETED', { args: { id } }),
    };
  }
}
