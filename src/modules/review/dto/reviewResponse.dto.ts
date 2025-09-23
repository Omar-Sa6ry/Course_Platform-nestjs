import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { Review } from '../entity/review.entity';

@ObjectType()
export class ReviewResponse extends BaseResponse {
  @Field(() => Review, { nullable: true })
  @Expose()
  data: Review;
}

@ObjectType()
export class ReviewsResponse extends BaseResponse {
  @Field(() => [Review], { nullable: true })
  items: Review[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
