import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { IsOptional } from 'class-validator';
import { Request } from '../entity/request.entity';
import { BaseResponse, PaginationInfo } from '@bts-soft/core';

@ObjectType()
export class RequestResponse extends BaseResponse {
  @Field(() => Request, { nullable: true })
  @Expose()
  data: Request;
}

@ObjectType()
export class RequestsResponse extends BaseResponse {
  @Field(() => [Request], { nullable: true })
  items: Request[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}

@ObjectType()
export class RequestCountResponse extends BaseResponse {
  @Field(() => Int, { nullable: true })
  @Expose()
  data: number;
}
