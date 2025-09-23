import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { CartService } from './cart.service';
import { CartResponse } from './dtos/cartResponse';
import { CartItemsResponse } from './dtos/cartItem.dto';
import { TotalCartsResponse } from './dtos/totalCarts.dto';
import { Permission } from '../../common/constant/enum.constant';
import { Auth } from 'src/common/decorator/auth.decorator';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem.enitty';
import { CourseIdInput } from '../courses/inputs/courseId.input';
import { CartIdInput } from './inputs/cartId.input';

@Resolver(() => Cart)
export class CartResolver {
  constructor(private readonly cartService: CartService) {}

  @Mutation(() => CartResponse)
  @Auth([Permission.CREATE_CART])
  async addToCart(
    @CurrentUser() user: CurrentUserDto,
    @Args('courseIdInput') courseIdInput: CourseIdInput,
  ): Promise<CartResponse> {
    return this.cartService.addToCart(user.id, courseIdInput);
  }

  @Mutation(() => CartResponse)
  @Auth([Permission.DELETE_CART])
  async deleteCart(
    @CurrentUser() user: CurrentUserDto,
    @Args('cartIdInput') cartIdInput: CartIdInput,
  ): Promise<CartResponse> {
    return this.cartService.deleteCart(user.id, cartIdInput);
  }

  @Mutation(() => CartResponse)
  @Auth([Permission.UPDATE_CART])
  async emptyCart(@CurrentUser() user: CurrentUserDto): Promise<CartResponse> {
    return this.cartService.emptyCart(user.id);
  }

  @Query(() => TotalCartsResponse)
  @Auth([Permission.VIEW_CART])
  async getCartTotal(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<TotalCartsResponse> {
    return this.cartService.checkTotalCart(user.id);
  }

  @Query(() => CartItemsResponse)
  @Auth([Permission.VIEW_CART])
  async findCartItems(
    @CurrentUser() user: CurrentUserDto,
    @Args('cartId') cartId: CartIdInput,
  ): Promise<CartItemsResponse> {
    return this.cartService.findCartItems(cartId, user.id);
  }

  @Query(() => CartResponse)
  @Auth([Permission.VIEW_CART])
  async findCart(@CurrentUser() user: CurrentUserDto): Promise<CartResponse> {
    return this.cartService.findCart(user.id);
  }

  @ResolveField(() => [CartItem])
  async items(@Parent() cart: Cart): Promise<CartItem[]> {
    return this.cartService.getCartItemsByCartId(cart.id);
  }
}
