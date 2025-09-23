import { UserProxy } from '../../users/proxy/user.proxy';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CourseProxy } from 'src/modules/courses/proxy/course.proxy';
import { CourseIdInput } from 'src/modules/courses/inputs/courseId.input';
import { Wishlist } from '../entity/wishlist.entity';
import { WishlistProxy } from '../proxy/wishlist.proxy';
import { Transactional } from 'typeorm-transactional';
import { IWishlistFascade } from '../interfaces/IWishlistFascade.interface';
import { WishlistResponse } from '../dto/wishlistResponse.dto';
import { WishlistUniqueHandler } from '../chain/wishlist.chain';

@Injectable()
export class WishlistFascade implements IWishlistFascade {
  constructor(
    private readonly i18n: I18nService,
    private readonly userProxy: UserProxy,
    private readonly courseProxy: CourseProxy,
    private readonly wishlistProxy: WishlistProxy,
    @InjectRepository(Wishlist)
    private readonly wishlistRepository: Repository<Wishlist>,
  ) {}

  @Transactional()
  async create(
    courseIdInput: CourseIdInput,
    userId: string,
  ): Promise<WishlistResponse> {
    const existsHandler = new WishlistUniqueHandler(
      userId,
      courseIdInput.courseId,
      this.wishlistRepository,
    );

    await Promise.all([
      this.userProxy.findById(userId),
      this.courseProxy.findById(courseIdInput.courseId),
      existsHandler.handle(null, this.i18n),
    ]);

    const wishlist = this.wishlistRepository.create({
      userId,
      courseId: courseIdInput.courseId,
    });
    await this.wishlistRepository.save(wishlist);

    return {
      message: this.i18n.t('wishlist.CREATED'),
      data: wishlist,
    };
  }

  @Transactional()
  async delete(wishlistId: string): Promise<WishlistResponse> {
    const wishlist = (await this.wishlistProxy.findById(wishlistId))?.data;

    await this.wishlistRepository.remove(wishlist);
    return {
      message: this.i18n.t('wishlist.DELETED'),
      data: wishlist,
    };
  }
}
