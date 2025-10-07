import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, JoinColumn, Index, Unique } from 'typeorm';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { User } from 'src/modules/users/entity/user.entity';
import { Course } from 'src/modules/courses/entity/course.entity';
import { RequestStatus } from 'src/common/constant/enum.constant';

@ObjectType()
@Entity('requests')
@Unique(['userId', 'courseId', 'status'])
@Index(['status', 'courseId', 'userId', 'id'])
export class Request extends BaseEntity {
  @Field(() => String)
  @Column({ length: 26 })
  userId: string;

  @Field(() => String)
  @Column({ length: 26 })
  courseId: string;

  @Field(() => RequestStatus)
  @Column({
    type: 'enum',
    enum: RequestStatus,
    default: RequestStatus.PENDING,
  })
  status: RequestStatus;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Field(() => Course)
  @ManyToOne(() => Course, (course) => course.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;
}
