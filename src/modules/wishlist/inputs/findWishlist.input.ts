import { InputType } from '@nestjs/graphql';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class FindWishlistInput {
  @IdField('User', true)
  userId?: string;

  @IdField('Course', true)
  courseId?: string;
}
