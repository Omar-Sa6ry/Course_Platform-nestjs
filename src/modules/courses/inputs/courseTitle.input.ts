import { InputType, Field } from '@nestjs/graphql';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';

@InputType()
export class CourseTitleInput {
  @Field(() => String)
  @CapitalTextField('Title', 100)
  title: string;
}
