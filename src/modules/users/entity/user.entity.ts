import { BaseEntity, CapitalTextField, EmailField, NationalIdField, PhoneField } from '@bts-soft/core';
import { ObjectType, Field } from '@nestjs/graphql';
import { Exclude } from 'class-transformer';
import { Role } from 'src/common/constant/enum.constant';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { Certificate } from 'src/modules/certificate/entity/certificate.entity';
import { Course } from 'src/modules/courses/entity/course.entity';
import { Request } from 'src/modules/request/entity/request.entity';
import { Review } from 'src/modules/review/entity/review.entity';
import { Wishlist } from 'src/modules/wishlist/entity/wishlist.entity';
import {
  Entity,
  Column,
  Index,
  BeforeInsert,
  BeforeUpdate,
  Check,
  OneToMany,
  OneToOne,
} from 'typeorm';

@ObjectType()
@Entity('users')
@Check(`("password" IS NOT NULL) OR ("googleId" IS NOT NULL)`)
@Index(['email', 'id', 'phone'])
export class User extends BaseEntity {
  @Field(() => String)
  @Column({ length: 100, nullable: true })
  @CapitalTextField('firstName')
  firstName?: string;

  @Field(() => String)
  @Column({ length: 100, nullable: true })
  @CapitalTextField('lastName')
  lastName?: string;

  @Field(() => String)
  @Column({ length: 201, nullable: true })
  fullName?: string;

  @Field(() => String)
  @Column({ length: 200 })
  @CapitalTextField('Headline')
  headline: string;

  @Field(() => String)
  @Column({ unique: true })
  @PhoneField()
  phone: string;

  @Field(() => String)
  @Column({ unique: true })
  @PhoneField()
  whatsapp: string;

  @Field(() => String)
  @Column({ unique: true })
  @NationalIdField()
  nationalId: string;

  @Field(() => String)
  @Column({ length: 100, unique: true })
  @EmailField()
  email: string;

  @Exclude()
  @Column({ nullable: true })
  password?: string;

  @Exclude()
  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Exclude()
  @Column({ nullable: true, unique: true })
  googleId?: string;

  @Field({ nullable: true })
  @Column({ length: 255, nullable: true })
  avatar?: string;

  @Field(() => Boolean, { nullable: true })
  @Column({ default: false })
  isActive: boolean;

  @Exclude()
  @Column({ nullable: true })
  resetToken?: string;

  @Exclude()
  @Column({ type: 'timestamp', nullable: true })
  resetTokenExpiry?: Date | null;

  @Exclude()
  @Column({ nullable: true })
  fcmToken?: string;

  @Field(() => Cart, { nullable: true })
  @OneToOne(() => Cart, (cart) => cart.user, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  cart?: Cart;

  @Field(() => [Course], { nullable: true })
  @OneToMany(() => Course, (course) => course.instructor)
  courses?: Course[];

  @Field(() => [Request])
  @OneToMany(() => Request, (request) => request.user, { onDelete: 'SET NULL' })
  requests: Request[];

  @Field(() => [Certificate])
  @OneToMany(() => Certificate, (certificate) => certificate.user, {
    onDelete: 'SET NULL',
  })
  certificates: Certificate[];

  @Field(() => [Review])
  @OneToMany(() => Review, (review) => review.student, {
    onDelete: 'SET NULL',
  })
  reviews: Review[];

  @Field(() => [Wishlist])
  @OneToMany(() => Wishlist, (wishlist) => wishlist.course, {
    onDelete: 'SET NULL',
  })
  wishlist: Wishlist[];

  @BeforeInsert()
  @BeforeUpdate()
  updateFullName() {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
}
