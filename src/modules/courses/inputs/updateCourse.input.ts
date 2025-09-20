import { InputType, PartialType } from '@nestjs/graphql';
import { CreateCourseInput } from './createCourse.input';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class UpdateCourseInput extends PartialType(CreateCourseInput) {
  @IdField('course')
  id: string;
}
