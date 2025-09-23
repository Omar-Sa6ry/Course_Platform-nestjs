import { InputType, PartialType, OmitType } from '@nestjs/graphql';
import { CreateReviewInput } from './createReview.input';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class UpdateReviewInput extends PartialType(
  OmitType(CreateReviewInput, ['courseId']),
) {
  @IdField('course')
  id: string;
}
