import { IdField } from '@bts-soft/core';
import { InputType } from '@nestjs/graphql';

@InputType()
export class CreateCertificateInput {
  @IdField('Course')
  courseId: string;

  @IdField('User')
  userId: string;
}
