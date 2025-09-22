import { InputType } from '@nestjs/graphql';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class CreateCertificateInput {
  @IdField('Course')
  courseId: string;

  @IdField('User')
  userId: string;
}
