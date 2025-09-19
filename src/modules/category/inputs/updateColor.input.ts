import { InputType } from '@nestjs/graphql';
import { IsOptional } from 'class-validator';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { TextField } from 'src/common/decorator/validation/TextField.decorator';

@InputType()
export class UpdateCategoryInput {
  @IsOptional()
  @CapitalTextField('Category name', 100, true)
  name?: string;

  @IsOptional()
  @TextField('Category Description', 200, true)
  description?: string;
}
