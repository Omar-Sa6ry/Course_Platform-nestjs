import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entity/category.entity';
import { CategoryProxy } from './proxy/category.proxy';
import { CategoryFascade } from './fascade/category.fascade';
import { CategoryService } from './category.service';
import { CategoryResolver } from './category.resolver';
import { UserModule } from '../users/users.module';
import {
  CreateCategoryStrategy,
  UpdateCategoryStrategy,
} from './strategy/category.stategy';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), UserModule],
  providers: [
    CategoryService,
    CategoryProxy,
    CategoryFascade,
    CreateCategoryStrategy,
    UpdateCategoryStrategy,
    CategoryResolver,
  ],
  exports: [CategoryService, CategoryProxy, TypeOrmModule],
})
export class CategoryModule {}
