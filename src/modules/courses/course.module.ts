import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../users/users.module';
import { Course } from './entity/course.entity';
import { CourseDataLoaders } from './dataloaders/course.loader';
import { CourseService } from './course.service';
import { CourseProxy } from './proxy/course.proxy';
import { CourseFascade } from './fascade/course.fascade';
import { CourseResolver } from './course.resolver';
import { CreateCourseStrategy } from './stratgies/createCourse.stratgy';
import { RedisModule } from 'src/common/redis/redis.module';
import { UpdateCourseStrategy } from './stratgies/updateCourse.stratgy';
import { UploadModule } from 'src/common/upload/upload.module';
import { CategoryModule } from '../category/category.module';
import { RequestModule } from '../request/request.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course]),
    RedisModule,
    UploadModule,
    UserModule,
    CategoryModule,
    forwardRef(() => RequestModule),
  ],
  providers: [
    CourseService,
    CourseProxy,
    CourseFascade,
    CourseResolver,
    CourseDataLoaders,
    CreateCourseStrategy,
    UpdateCourseStrategy,
  ],
  exports: [CourseService, CourseProxy, TypeOrmModule],
})
export class CourseModule {}
