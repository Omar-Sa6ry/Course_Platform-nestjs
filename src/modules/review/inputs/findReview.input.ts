import { InputType } from '@nestjs/graphql';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class FindReviewInput {
  @IdField('Course', true)
  courseId: string;

  @IdField('Student', true)
  studentId: string;
}
