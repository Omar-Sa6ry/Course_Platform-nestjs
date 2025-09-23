import { Injectable } from '@nestjs/common';
import { WishlistFascade } from './fascade/wishlist.fascade';
import { WishlistProxy } from './proxy/wishlist.proxy';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { FindWishlistInput } from './inputs/findWishlist.input';
import { CoursesResponse } from '../courses/dto/courseResponse.dto';

import {
  WishlistResponse,
  WishlistsResponse,
} from './dto/wishlistResponse.dto';

@Injectable()
export class WishlistService {
  constructor(
    private readonly wishlistFascade: WishlistFascade,
    private readonly wishlistProxy: WishlistProxy,
  ) {}

  async create(courseIdInput, userId): Promise<WishlistResponse> {
    return this.wishlistFascade.create(courseIdInput, userId);
  }

  async delete(wishlistId): Promise<WishlistResponse> {
    return this.wishlistFascade.delete(wishlistId);
  }

  async findById(id): Promise<WishlistResponse> {
    return this.wishlistProxy.findById(id);
  }

  async findAll(
    findWishlistInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<WishlistsResponse> {
    return this.wishlistProxy.findAll(findWishlistInput, page, limit);
  }

  async findAllWithPagination(
    findWishlistInput: FindWishlistInput,
  ): Promise<WishlistsResponse> {
    return this.wishlistProxy.findAllWithPagination(findWishlistInput);
  }

  async findCoursesByUserId(userId: string): Promise<CoursesResponse> {
    return this.wishlistProxy.getCoursesForUser(userId);
  }
}
