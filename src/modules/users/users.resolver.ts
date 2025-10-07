import { UserService } from 'src/modules/users/users.service';
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import { UpdateUserDto } from './inputs/UpdateUser.dto';
import { Permission } from 'src/common/constant/enum.constant';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { Auth } from 'src/common/decorator/auth.decorator';
import {
  UserCountResponse,
  UserResponse,
  UsersResponse,
} from './dto/UserResponse.dto';
import { EmailInput, UserIdInput } from './inputs/user.input';
import { UserFacadeService } from './fascade/user.fascade';
import { User } from './entity/user.entity';
import { Cart } from '../cart/entities/cart.entity';
import { CartProxy } from '../cart/proxy/Cart.proxy';

@Resolver(() => User)
export class UserResolver {
  constructor(
    private readonly userFacade: UserFacadeService,
    private readonly userService: UserService,
    private readonly cartProxy: CartProxy,
  ) {}

  @Query((returns) => UserResponse)
  @Auth([Permission.VIEW_USER])
  async getUserById(@Args('id') id: UserIdInput): Promise<UserResponse> {
    return await this.userService.findById(id.UserId);
  }

  @Query((returns) => UserResponse)
  @Auth([Permission.VIEW_USER])
  async getUserByEmail(
    @Args('email') email: EmailInput,
  ): Promise<UserResponse> {
    return await this.userService.findByEmail(email.email);
  }

  @Query((returns) => UsersResponse)
  @Auth([Permission.VIEW_USER])
  async getUsers(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<UsersResponse> {
    return await this.userService.findUsers(page, limit);
  }

  @Query((returns) => UsersResponse)
  @Auth([Permission.VIEW_USER])
  async getInstructors(
    @Args('page', { type: () => Int, nullable: true }) page?: number,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
  ): Promise<UsersResponse> {
    return await this.userService.findInstructors(page, limit);
  }

  @Query((returns) => UserCountResponse)
  @Auth([Permission.VIEW_USER])
  async getInstructorsCount(): Promise<UserCountResponse> {
    return await this.userService.getInstructorsCout();
  }

  @Query((returns) => UserCountResponse)
  @Auth([Permission.VIEW_USER])
  async averageStudentsToInstructor(): Promise<UserCountResponse> {
    return await this.userService.averageStudentsToInstructor();
  }

  @Query((returns) => UserCountResponse)
  @Auth([Permission.VIEW_USER])
  async coutActiveInstructors(): Promise<UserCountResponse> {
    return await this.userService.coutActiveInstructors();
  }

  @Query((returns) => UserCountResponse)
  @Auth([Permission.VIEW_USER])
  async unAcutActiveInstructors(): Promise<UserCountResponse> {
    return await this.userService.unAcutActiveInstructors();
  }

  @Query((returns) => UserCountResponse)
  @Auth([Permission.VIEW_USER])
  async coutActiveUsers(): Promise<UserCountResponse> {
    return await this.userService.coutActiveUsers();
  }

  @Query((returns) => UserCountResponse)
  @Auth([Permission.VIEW_USER])
  async coutunActiveUsers(): Promise<UserCountResponse> {
    return await this.userService.coutunActiveUsers();
  }

  @Query((returns) => UserCountResponse)
  @Auth([Permission.VIEW_USER])
  async getUsersCount(): Promise<UserCountResponse> {
    return await this.userService.getUsersCount();
  }

  @Mutation((returns) => UserResponse)
  @Auth([Permission.UPDATE_USER])
  async updateUser(
    @CurrentUser() user: CurrentUserDto,
    @Args('updateUserDto') updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.userFacade.update(updateUserDto, user.id);
  }

  @Query((returns) => UserResponse)
  @Auth([Permission.DELETE_USER])
  async deleteUser(@Args('id') id: UserIdInput): Promise<UserResponse> {
    return await this.userFacade.deleteUser(id.UserId);
  }

  @Query((returns) => UserResponse)
  @Auth([Permission.CREATE_INSTRUCTOR])
  async createInstractor(@Args('id') id: UserIdInput): Promise<UserResponse> {
    return await this.userService.createInstructor(id.UserId);
  }

  @Mutation((returns) => UserResponse)
  @Auth([Permission.EDIT_USER_ROLE])
  async UpdateUserRoleToAdmin(
    @Args('id') id: UserIdInput,
  ): Promise<UserResponse> {
    return await this.userFacade.editUserRole(id.UserId);
  }

  // Resolver Fields
  @ResolveField(() => Cart)
  async cart(@Parent() user: User): Promise<Cart> {
    return (await this.cartProxy.findCart(user.id))?.data || null;
  }
}
