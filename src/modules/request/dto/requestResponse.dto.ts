import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { Request } from '../entity/request.entity';

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
