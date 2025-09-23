import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/entity/user.entity';
import { CartItem } from './cartItem.enitty';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';

@Entity()
@ObjectType()
export class Cart extends BaseEntity {
  @Column('numeric', { precision: 10, scale: 2, nullable: true })
  @Field(() => Number)
  totalPrice: number;

  @Field(() => String)
  @Column({ length: 26 })
  @Index()
  userId: string;

  @OneToOne(() => User, (user) => user.cart, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => [CartItem], { nullable: true })
  @OneToMany(() => CartItem, (CartItem) => CartItem.cart, {
    onDelete: 'SET NULL',
  })
  cartItems: CartItem[];
}
