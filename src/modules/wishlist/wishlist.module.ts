import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wishlist } from './entity/wishlist.entity';
import { WishlistService } from './wishlist.service';
import { WishlistFascade } from './fascade/wishlist.fascade';
import { WishlistProxy } from './proxy/wishlist.proxy';
import { WishlistResolver } from './wishlist.resolver';
import { WishlistLoader } from './dataloaders/wishlist.dataLoader';
import { CourseModule } from '../courses/course.module';
import { UserModule } from '../users/users.module';
import { CourseLoaderForUser } from '../request/dataloaders/CourseLoaderForUser.dataloader';

@Module({
  imports: [TypeOrmModule.forFeature([Wishlist]), UserModule, CourseModule],
  providers: [
    WishlistService,
    WishlistFascade,
    WishlistProxy,
    WishlistResolver,
    WishlistLoader,
    CourseLoaderForUser,
  ],

  exports: [WishlistProxy, WishlistFascade, TypeOrmModule],
})
export class WishlistModule {}
