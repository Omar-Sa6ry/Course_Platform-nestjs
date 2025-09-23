import {
  Resolver,
  Query,
  Mutation,
  Args,
  Parent,
  ResolveField,
} from '@nestjs/graphql';
import { WishlistService } from './wishlist.service';
import { Wishlist } from './entity/wishlist.entity';
import { CoursesResponse } from '../courses/dto/courseResponse.dto';
import { CourseIdInput } from '../courses/inputs/courseId.input';
import { WishlistLoader } from './dataloaders/wishlist.dataLoader';
import { FindWishlistInput } from './inputs/findWishlist.input';
import { Auth } from 'src/common/decorator/auth.decorator';
import { Permission } from 'src/common/constant/enum.constant';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { Course } from '../courses/entity/course.entity';
import { User } from '../users/entity/user.entity';
import {
  WishlistResponse,
  WishlistsResponse,
} from './dto/wishlistResponse.dto';

@Resolver(() => Wishlist)
export class WishlistResolver {
  constructor(
    private readonly relationsLoader: WishlistLoader,
    private readonly wishlistService: WishlistService,
  ) {}

  @Auth([Permission.CREATE_WISHLIST])
  @Mutation(() => WishlistResponse)
  async createWishlist(
    @Args('courseIdInput') courseIdInput: CourseIdInput,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<WishlistResponse> {
    return this.wishlistService.create(courseIdInput, user.id);
  }

  @Auth([Permission.DELETE_WISHLIST])
  @Mutation(() => WishlistResponse)
  async deleteWishlist(
    @Args('wishlistId') wishlistId: string,
  ): Promise<WishlistResponse> {
    return this.wishlistService.delete(wishlistId);
  }

  @Auth([Permission.VIEW_WISHLIST])
  @Query(() => WishlistResponse)
  async findWishlistById(@Args('id') id: string): Promise<WishlistResponse> {
    return this.wishlistService.findById(id);
  }

  @Auth([Permission.VIEW_WISHLIST])
  @Query(() => WishlistsResponse)
  async findAllWishlists(
    @Args('findWishlistInput', { nullable: true })
    findWishlistInput?: FindWishlistInput,
    @Args('page', { nullable: true }) page?: number,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<WishlistsResponse> {
    return this.wishlistService.findAll(findWishlistInput, page, limit);
  }

  @Auth([Permission.VIEW_WISHLIST])
  @Query(() => WishlistsResponse)
  async findAllWishlistsWithoutPag(
    @Args('findWishlistInput', { nullable: true })
    findWishlistInput?: FindWishlistInput,
  ): Promise<WishlistsResponse> {
    return this.wishlistService.findAllWithPagination(findWishlistInput);
  }

  @Auth([Permission.VIEW_WISHLIST])
  @Query(() => CoursesResponse)
  async findCoursesForUserInWishlist(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<CoursesResponse> {
    return this.wishlistService.findCoursesByUserId(user.id);
  }

  @ResolveField(() => User)
  async user(@Parent() wishlist: Wishlist): Promise<User> {
    return this.relationsLoader.batchUsers.load(wishlist.userId);
  }

  @ResolveField(() => Course)
  async course(@Parent() wishlist: Wishlist): Promise<Course> {
    return this.relationsLoader.batchCourses.load(wishlist.courseId);
  }
}
