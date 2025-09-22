import { InputType, Field, ID } from '@nestjs/graphql';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class CertificateIdInput {
  @IdField('certificate Id')
  certificateId: string;
}
