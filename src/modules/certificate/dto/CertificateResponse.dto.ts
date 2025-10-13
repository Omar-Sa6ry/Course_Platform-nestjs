import { Field, ObjectType } from '@nestjs/graphql';
import { Certificate } from '../entity/certificate.entity';
import { BaseResponse, PaginationInfo } from '@bts-soft/core';

@ObjectType()
export class CertificateResponse extends BaseResponse {
  @Field(() => Certificate, { nullable: true })
  data?: Certificate;
}

@ObjectType()
export class CertificatesResponse extends BaseResponse {
  @Field(() => [Certificate], { nullable: true })
  items?: Certificate[];

  @Field(() => PaginationInfo, { nullable: true })
  pagination?: PaginationInfo;
}
