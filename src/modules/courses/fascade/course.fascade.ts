import { RedisService } from './../../../common/redis/redis.service';
import { UploadService } from 'src/common/upload/upload.service';
import { BadRequestException, Injectable } from '@nestjs/common';
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
import { RequestProxy } from 'src/modules/request/proxy/request.proxy';
import { RequestStatus } from 'src/common/constant/enum.constant';
import { UserFacadeService } from 'src/modules/users/fascade/user.fascade';
import { Request } from 'src/modules/request/entity/request.entity';
import { User } from 'src/modules/users/entity/user.entity';

@Injectable()
export class CourseFascade {
  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    private readonly courseProxy: CourseProxy,
    private readonly userFascade: UserFacadeService,
    private readonly requestProxy: RequestProxy,
    private readonly createStrategy: CreateCourseStrategy,
    private readonly updateStrategy: UpdateCourseStrategy,
    private readonly uploadService: UploadService,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
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

    this.redisService.update(`course:${updatedCourse.id}`, updatedCourse);

    return {
      data: updatedCourse,
      message: await this.i18n.t('course.UPDATED', {
        args: { title: updatedCourse.title },
      }),
    };
  }

  @Transactional()
  async activate(id: string): Promise<CourseResponse> {
    const course = (await this.courseProxy.findById(id))?.data;

    if (course?.isActive) {
      throw new BadRequestException(
        await this.i18n.t('course.ALREADY_ACTIVE', {
          args: { title: course.title },
        }),
      );
    }

    course!.isActive = true;
    await this.courseRepository.save(course!);

    this.userFascade.activeUser(course.instructor.id);
    this.requestProxy.findSendEmailForUsers(
      course.title,
      await this.i18n.t('course.COURSE_IS_ACTIVE', {
        args: { title: course.title },
      }),
      {
        courseId: id,
        status: RequestStatus.PENDING || RequestStatus.APPROVED,
      },
    );

    const courses = await this.courseRepository.count({
      where: { isActive: true },
    });
    this.redisService.update(`course_count:all`, courses);

    return {
      data: course,
      message: await this.i18n.t('course.COURSE_IS_ACTIVE', {
        args: { title: course.title },
      }),
    };
  }

  @Transactional()
  async deactivate(id: string): Promise<CourseResponse> {
    const course = (await this.courseProxy.findById(id))?.data;

    if (!course?.isActive)
      throw new BadRequestException(
        await this.i18n.t('course.ALREADY_INACTIVE', {
          args: { title: course.title },
        }),
      );

    course!.isActive = false;
    await this.courseRepository.save(course!);
    this.searchOnInstractorsCourses(course.instructor.id);
    this.searchOnUsersCourses(id);

    this.requestProxy.findSendEmailForUsers(
      course.title,
      await this.i18n.t('course.COURSE_IS_ENDED', {
        args: { title: course.title },
      }),
      {
        courseId: id,
        status: RequestStatus.PENDING || RequestStatus.APPROVED,
      },
    );

    const courses = await this.courseRepository.count({
      where: { isActive: true },
    });
    this.redisService.update(`course_count:all`, courses);

    return {
      data: course,
      message: await this.i18n.t('course.COURSE_IS_INACTIVE', {
        args: { title: course.title },
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

  // private Services

  private async searchOnInstractorsCourses(id: string): Promise<void> {
    const courses = await this.courseRepository.count({
      where: { instructor: { id } },
    });

    if (courses === 1) this.userFascade.unActiveUser(id);
  }

  private async searchOnUsersCourses(id: string) {
    const requests = await this.requestRepository.find({
      where: { courseId: id },
    });
    const usersIds = requests.map((request) => request.userId);

    const users = await this.userRepository.findByIds(usersIds);

    users.map((user, index) => {
      this.userFascade.unActiveUser(user.email);
    });
  }
}
