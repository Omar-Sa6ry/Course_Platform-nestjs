import { InputType, Field, ID } from '@nestjs/graphql';
import { IdField } from 'src/common/decorator/validation/IdValidate.decorator';

@InputType()
export class CartIdInput {
  @IdField('cart Id')
  cartId: string;
}
