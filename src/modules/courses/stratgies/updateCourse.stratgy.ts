import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entity/course.entity';
import { UpdateCourseInput } from '../inputs/updateCourse.input';
import { ICourseStrategy } from '../interfaces/ICourseStratgy.interface';

@Injectable()
export class UpdateCourseStrategy implements ICourseStrategy {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async execute(input: UpdateCourseInput): Promise<Course> {
    const course = await this.courseRepository.findOne({
      where: { id: input.id },
      relations: ['instructor', 'category'],
    });
    
    if (!course)
      throw new NotFoundException(`Course with ID ${input.id} not found`);

    Object.assign(course, input);
    return await this.courseRepository.save(course);
  }
}
