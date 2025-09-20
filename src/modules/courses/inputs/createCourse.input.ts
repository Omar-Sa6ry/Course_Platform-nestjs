import { InputType, Field, Float } from '@nestjs/graphql';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { CourseLevel } from 'src/common/constant/enum.constant';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';
import { TextField } from 'src/common/decorator/validation/TextField.decorator';
import { CreateImagDto } from 'src/common/upload/dtos/createImage.dto';
import { CreateVideoDto } from 'src/common/upload/dtos/createVideo.dto';

@InputType()
export class CreateCourseInput {
  @CapitalTextField('Title', 100)
  title: string;

  @CapitalTextField('subtitle', 100)
  subtitle: string;

  @TextField('description', 255)
  description: string;

  @TextField('targetAudience', 255)
  targetAudience: string;

  @TextField('requirements', 255)
  requirements: string;

  @TextField('learningOutcomes', 255)
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
  @Field(() => CreateImagDto, { nullable: true })
  image: CreateImagDto;

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
