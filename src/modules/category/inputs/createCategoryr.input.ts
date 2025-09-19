import { Field, InputType } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { TextField } from 'src/common/decorator/validation/TextField.decorator';

@InputType()
export class CreateCategoryInput {
  @CapitalTextField('Category name', 100,false)
  name: string;

  @TextField('Category Description', 200, false)
  description: string;
}
