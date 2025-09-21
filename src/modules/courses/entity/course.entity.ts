import { ObjectType, Field, Float, Int } from '@nestjs/graphql';
import { Entity, Column, ManyToOne, Index, OneToMany } from 'typeorm';
import { BaseEntity } from 'src/common/bases/BaseEntity';
import { User } from 'src/modules/users/entity/user.entity';
import { Category } from 'src/modules/category/entity/category.entity';
import { CourseLevel } from 'src/common/constant/enum.constant';
import { Request } from 'src/modules/request/entity/request.entity';

@ObjectType()
@Entity('courses')
@Index(['title', 'price'])
export class Course extends BaseEntity {
  @Field(() => String)
  @Column({ length: 100 })
  title: string;

  @Field(() => String)
  @Column({ length: 100 })
  subtitle: string;

  @Field(() => String)
  @Column({ length: 255 })
  description: string;

  @Field(() => String)
  @Column({ length: 255 })
  learningOutcomes: string;

  @Field(() => String)
  @Column({ length: 255 })
  requirements: string;

  @Field(() => String)
  @Column({ length: 255 })
  targetAudience: string;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  price: number;

  @Field(() => Float, { nullable: true })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  discountPrice?: number;

  @Field(() => CourseLevel)
  @Column({
    type: 'enum',
    enum: CourseLevel,
  })
  level: CourseLevel;

  @Field(() => String, { nullable: true })
  @Column({ length: 500, nullable: true })
  imageUrl?: string;

  @Field(() => String, { nullable: true })
  @Column({ length: 500, nullable: true })
  promoVideoUrl?: string;

  @Field(() => Int)
  @Column({ default: 1 })
  totalLectures: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.0 })
  totalHours: number;

  @Field(() => Float)
  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0.0 })
  ratingAvg: number;

  @Field(() => Int)
  @Column({ default: 0 })
  ratingCount: number;

  @Field(() => Int)
  @Column({ default: 0 })
  studentCount: number;

  @Field(() => Boolean, { nullable: true })
  @Column({ default: true })
  isActive: boolean;

  @Field(() => User)
  @ManyToOne(() => User, (user) => user.courses, { onDelete: 'SET NULL' })
  instructor: User;

  @Field(() => Category)
  @ManyToOne(() => Category, (category) => category.courses, {
    onDelete: 'SET NULL',
  })
  category: Category;

  @Field(() => [Request])
  @OneToMany(() => Request, (request) => request.course, { onDelete: 'SET NULL' })
  requests: Request[];
}
