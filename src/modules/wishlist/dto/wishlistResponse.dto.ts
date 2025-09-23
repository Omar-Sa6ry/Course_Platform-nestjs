import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Expose } from 'class-transformer';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { IsOptional } from 'class-validator';
import { Wishlist } from '../entity/wishlist.entity';

@ObjectType()
export class WishlistResponse extends BaseResponse {
  @Field(() => Wishlist, { nullable: true })
  @Expose()
  data: Wishlist;
}

@ObjectType()
export class WishlistsResponse extends BaseResponse {
  @Field(() => [Wishlist], { nullable: true })
  items: Wishlist[];

  @IsOptional()
  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}

@ObjectType()
export class WishlistCountResponse extends BaseResponse {
  @Field(() => Int, { nullable: true })
  @Expose()
  data: number;
}
