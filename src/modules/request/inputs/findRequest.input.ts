import { IdField } from '@bts-soft/core';
import { Field, InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { RequestStatus } from 'src/common/constant/enum.constant';

@InputType()
export class FindRequestInput {
  @IdField('User', 26, true)
  userId?: string;

  @IdField('Course', 26, true)
  courseId?: string;

  @IsOptional()
  @Field(() => RequestStatus, { nullable: true })
  status?: RequestStatus;
}
