import { Field, ObjectType } from '@nestjs/graphql';
import { BaseResponse } from 'src/common/bases/BaseResponse';
import { PaginationInfo } from 'src/common/dtos/pagintion';
import { Certificate } from '../entity/certificate.entity';

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
