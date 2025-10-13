import { ObjectType, Field } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { User } from 'src/modules/users/entity/user.entity';
import { Course } from 'src/modules/courses/entity/course.entity';
import { BaseEntity } from '@bts-soft/core';

@ObjectType()
@Entity('wishlists')
@Unique(['userId', 'courseId'])
@Index(['userId'])
export class Wishlist extends BaseEntity {
  @Field(() => String)
  @Column({ length: 26 })
  userId: string;

  @Field(() => String)
  @Column({ length: 26 })
  courseId: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.wishlist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Course)
  @ManyToOne(() => Course, (course) => course.wishlist, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
