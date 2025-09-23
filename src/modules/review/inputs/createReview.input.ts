import { Field, Float, InputType, Int } from '@nestjs/graphql';
import { IsNumber, Max, Min } from 'class-validator';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';
import { TextField } from 'src/common/decorator/validation/TextField.decorator';

@InputType()
export class CreateReviewInput {
  @IdField('Course')
  courseId: string;

  @TextField('comment')
  comment: string;

  @Field(() => Float)
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}
