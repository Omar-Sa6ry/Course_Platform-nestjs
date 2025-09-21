import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { RequestStatus } from 'src/common/constant/enum.constant';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class FindRequestInput {
  @IdField('User', true)
  userId?: string;

  @IdField('Course', true)
  courseId?: string;

  @IsOptional()
  @Field(() => RequestStatus, { nullable: true })
  status?: RequestStatus;
}
