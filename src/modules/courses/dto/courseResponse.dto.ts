import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { Course } from '../entity/course.entity';

@ObjectType()
export class CourseResponse extends BaseResponse {
  @Field(() => Course, { nullable: true })
  @Expose()
  data: Course;
}

@ObjectType()
export class CoursesResponse extends BaseResponse {
  @Field(() => [Course], { nullable: true })
  items: Course[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}

@ObjectType()
export class CourseCountResponse extends BaseResponse {
  @Field(() => Int, { nullable: true })
  @Expose()
  data: number;
}
