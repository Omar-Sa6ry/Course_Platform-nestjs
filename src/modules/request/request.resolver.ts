import { RequestService } from './request.service';
import { Request } from './entity/request.entity';
import { RequestResponse, RequestsResponse } from './dto/requestResponse.dto';
import { CoursesResponse } from '../courses/dto/courseResponse.dto';
import { CourseIdInput } from '../courses/inputs/courseId.input';
import { FindRequestInput } from './inputs/findRequest.input';
import { Auth } from 'src/common/decorator/auth.decorator';
import { Permission } from 'src/common/constant/enum.constant';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { Course } from '../courses/entity/course.entity';
import { User } from '../users/entity/user.entity';
import { RequestRelationsLoader } from './dataloaders/request.dataloader';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  Parent,
  ResolveField,
} from '@nestjs/graphql';

@Resolver(() => Request)
export class RequestResolver {
  constructor(
    private readonly relationsLoader: RequestRelationsLoader,
    private readonly requestService: RequestService,
  ) {}

  @Auth([Permission.CREATE_REQUEST])
  @Mutation(() => RequestResponse)
  async createRequest(
    @Args('courseIdInput') courseIdInput: CourseIdInput,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RequestResponse> {
    return this.requestService.create(courseIdInput, user.id);
  }

  @Auth([Permission.UPDATE_REQUEST])
  @Mutation(() => RequestResponse)
  async acceptRequest(
    @Args('requestId') requestId: string,
  ): Promise<RequestResponse> {
    return this.requestService.accept(requestId);
  }

  @Auth([Permission.UPDATE_REQUEST])
  @Mutation(() => RequestResponse)
  async rejectRequest(
    @Args('requestId') requestId: string,
  ): Promise<RequestResponse> {
    return this.requestService.reject(requestId);
  }

  @Auth([Permission.UPDATE_REQUESTFORUSER])
  @Mutation(() => RequestResponse)
  async cancelRequest(
    @Args('requestId') requestId: string,
    @CurrentUser() user: CurrentUserDto,
  ): Promise<RequestResponse> {
    return this.requestService.cancel(requestId, user.id);
  }

  @Auth([Permission.DELETE_REQUEST])
  @Mutation(() => RequestResponse)
  async deleteRequest(
    @Args('requestId') requestId: string,
  ): Promise<RequestResponse> {
    return this.requestService.delete(requestId);
  }

  @Auth([Permission.VIEW_REQUEST, Permission.VIEW_REQUEST_FOR_USER])
  @Query(() => RequestResponse)
  async findRequestById(@Args('id') id: string): Promise<RequestResponse> {
    return this.requestService.findById(id);
  }

  @Auth([Permission.VIEW_REQUEST])
  @Query(() => RequestsResponse)
  async findAllRequests(
    @Args('findRequestInput', { nullable: true })
    findRequestInput?: FindRequestInput,
    @Args('page', { nullable: true }) page?: number,
    @Args('limit', { nullable: true }) limit?: number,
  ): Promise<RequestsResponse> {
    return this.requestService.findAll(findRequestInput, page, limit);
  }

  @Auth([Permission.VIEW_REQUEST])
  @Query(() => RequestsResponse)
  async findAllRequestsWithoutPag(
    @Args('findRequestInput', { nullable: true })
    findRequestInput?: FindRequestInput,
  ): Promise<RequestsResponse> {
    return this.requestService.findAllWithPagination(findRequestInput);
  }

  @Auth([Permission.VIEW_REQUEST_FOR_USER])
  @Query(() => CoursesResponse)
  async findCoursesForUser(
    @CurrentUser() user: CurrentUserDto,
  ): Promise<CoursesResponse> {
    return this.requestService.findCoursesByUserId(user.id);
  }

  @Auth([Permission.VIEW_REQUEST])
  @Query(() => CoursesResponse)
  async findCoursesByUserId(
    @Args('userId') userId: string,
  ): Promise<CoursesResponse> {
    return this.requestService.findCoursesByUserId(userId);
  }

  @ResolveField(() => User)
  async user(@Parent() request: Request): Promise<User> {
    return this.relationsLoader.batchUsers.load(request.userId);
  }

  @ResolveField(() => Course)
  async course(@Parent() request: Request): Promise<Course> {
    return this.relationsLoader.batchCourses.load(request.courseId);
  }
}
