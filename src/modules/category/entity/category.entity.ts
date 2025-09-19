import { Field, ObjectType } from '@nestjs/graphql';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { CapitalTextField } from 'src/common/decorator/validation/CapitalField.decorator';
import { TextField } from 'src/common/decorator/validation/TextField.decorator';
import { Column, Entity, Index } from 'typeorm';

@ObjectType()
@Entity('categories')
export class Category extends BaseEntity {
  @Field(() => String)
  @Column({ type: 'varchar', length: 100 })
  @CapitalTextField('Category name', 100, false)
  @Index()
  name: string;

  @Field(() => String)
  @Column({ type: 'varchar', length: 200 })
  @TextField('Category Description', 200)
  description: string;
}
