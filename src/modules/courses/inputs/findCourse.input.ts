import { InputType, PartialType } from '@nestjs/graphql';
import { CreateCourseInput } from './createCourse.input';

@InputType()
export class FindCourseInput extends PartialType(CreateCourseInput) {}
