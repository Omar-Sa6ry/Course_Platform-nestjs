import * as DataLoader from 'dataloader';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from 'src/modules/users/entity/user.entity';
import { Category } from 'src/modules/category/entity/category.entity';

@Injectable()
export class CourseDataLoaders {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  createInstructorsLoader() {
    return new DataLoader<string, User>(async (instructorIds: string[]) => {
      const instructors = await this.userRepository.find({
        where: { id: In(instructorIds) },
      });

      const instructorMap = new Map(
        instructors.map((instructor) => [instructor.id, instructor]),
      );

      return instructorIds.map((id) => instructorMap.get(id));
    });
  }

  createCategoriesLoader() {
    return new DataLoader<string, Category>(async (categoryIds: string[]) => {
      const categories = await this.categoryRepository.find({
        where: { id: In(categoryIds) },
      });

      const categoryMap = new Map(
        categories.map((category) => [category.id, category]),
      );

      return categoryIds.map((id) => categoryMap.get(id));
    });
  }
}
