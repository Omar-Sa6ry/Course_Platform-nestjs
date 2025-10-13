import {
  CapitalTextField,
  CreateImageDto,
  CreateVideoDto,
  IdField,
  TextField,
} from '@bts-soft/core';
import { InputType, Field, Float } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CourseLevel } from 'src/common/constant/enum.constant';

@InputType()
export class CreateCourseInput {
  @CapitalTextField('Title', 1, 100)
  title: string;

  @CapitalTextField('subtitle', 1, 100)
  subtitle: string;

  @TextField('description', 1, 255)
  description: string;

  @TextField('targetAudience', 1, 255)
  targetAudience: string;

  @TextField('requirements', 1, 255)
  requirements: string;

  @TextField('learningOutcomes', 1, 255)
  learningOutcomes: string;

  @Field(() => CourseLevel)
  @IsEnum(CourseLevel, { message: 'Invalid course level' })
  level: CourseLevel;

  @IsOptional()
  @Field(() => Float, { nullable: true })
  @IsNumber({}, { message: 'Invalid discount price' })
  discountPrice?: number;

  @Field(() => Float)
  @IsNumber({}, { message: 'Invalid price' })
  price: number;

  @Field(() => Float)
  @IsNumber({}, { message: 'Invalid total hours' })
  totalHours: number;

  @Field(() => Float)
  @IsNumber({}, { message: 'Invalid total lectures' })
  totalLectures: number;

  @IsOptional()
  @Field(() => CreateImageDto, { nullable: true })
  image: CreateImageDto;

  @IsOptional()
  @Field(() => CreateVideoDto, { nullable: true })
  demo_video: CreateVideoDto;

  @IsOptional()
  @Field(() => Boolean, { nullable: true })
  isActive?: boolean;

  @IdField('instructor')
  instructorId: string;

  @IdField('category')
  categoryId: string;
}
