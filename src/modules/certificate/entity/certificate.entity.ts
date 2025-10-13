import { Field, ObjectType } from '@nestjs/graphql';
import { User } from 'src/modules/users/entity/user.entity';
import { Course } from 'src/modules/courses/entity/course.entity';
import { Column, Entity, Index, ManyToOne, Unique, JoinColumn } from 'typeorm';
import { BaseEntity } from '@bts-soft/core';

@ObjectType()
@Entity('certificates')
@Index(['userId'])
@Unique(['userId', 'courseId'])
export class Certificate extends BaseEntity {
  @Field(() => String)
  @Column({ length: 26 })
  userId: string;

  @Field(() => String)
  @Column({ length: 26 })
  courseId: string;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.certificates, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Course)
  @ManyToOne(() => Course, (course) => course.certificates, {
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
