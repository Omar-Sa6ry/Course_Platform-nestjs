import { Entity, Column, ManyToOne, Unique, Check } from 'typeorm';
import { Course } from 'src/modules/courses/entity/course.entity';
import { User } from 'src/modules/users/entity/user.entity';
import { Field, Float, ObjectType } from '@nestjs/graphql';
import { BaseEntity, TextField } from '@bts-soft/core';

@ObjectType()
@Entity('reviews')
@Unique(['student', 'course'])
@Check(`"rating" >= 1 AND "rating" <= 5`)
export class Review extends BaseEntity {
  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  rating: number;

  @Field(() => String, { nullable: true })
  @Column({ length: 100, nullable: true })
  @TextField('comment')
  comment?: string;
  
  @Field(() => String)
  @Column({ length: 26})
  studentId: string;

  @Field(() => String)
  @Column({ length: 26})
  courseId: string;

  @Field(() => Boolean)
  @Column({ type: 'boolean', default: true })
  isApproved: boolean;

  @Field(() => Course, { nullable: true })
  @ManyToOne(() => Course, (course) => course.reviews, { onDelete: 'CASCADE' })
  course: Course;

  @Field(() => User, { nullable: true })
  @ManyToOne(() => User, (user) => user.reviews, { onDelete: 'CASCADE' })
  student: User;
}
