import { Injectable } from '@nestjs/common';
import { CreateCategoryInput } from './inputs/createCategoryr.input';
import { UpdateCategoryInput } from './inputs/updateColor.input';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { CategoryProxy } from './proxy/category.proxy';
import { CategoryIdInput, CategoryNameInput } from './inputs/category.input';
import { CategoryFascade } from './fascade/category.fascade';

@Injectable()
export class CategoryService {
  constructor(
    private readonly categoryProxy: CategoryProxy,
    private readonly categoryFascade: CategoryFascade,
  ) {}

  async create(createCategoryInput: CreateCategoryInput) {
    return await this.categoryFascade.create(createCategoryInput);
  }

  async update(id: CategoryIdInput, updateCategoryInput: UpdateCategoryInput) {
    return await this.categoryFascade.update(
      id.categoryId,
      updateCategoryInput,
    );
  }

  async delete(id: CategoryIdInput) {
    return await this.categoryFascade.remove(id.categoryId);
  }

  async findById(id: CategoryIdInput) {
    return await this.categoryProxy.findById(id.categoryId);
  }

  async findByName(name: CategoryNameInput) {
    return await this.categoryProxy.findByName(name.name);
  }

  async findAll() {
    return await this.categoryProxy.findAll();
  }

  async findAllWithoutPag() {
    return await this.categoryProxy.findAllWithoutPag();
  }
}
