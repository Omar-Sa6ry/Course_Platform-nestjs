import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { ReviewService } from './review.service';
import { ReviewResponse, ReviewsResponse } from './dto/reviewResponse.dto';
import { CreateReviewInput } from './inputs/createReview.input';
import { UpdateReviewInput } from './inputs/updateReview.input';
import { FindReviewInput } from './inputs/findReview.input';
import { Review } from './entity/review.entity';
import { User } from '../users/entity/user.entity';
import { Course } from '../courses/entity/course.entity';
import { CurrentUser } from 'src/common/decorator/currentUser.decorator';
import { CurrentUserDto } from 'src/common/dtos/currentUser.dto';
import { ReviewLoaders } from './dataLoader/review.dataLoader';
import { Auth } from 'src/common/decorator/auth.decorator';
import { Permission } from 'src/common/constant/enum.constant';

@Resolver(() => Review)
export class ReviewResolver {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly reviewLoader: ReviewLoaders,
  ) {}

  @Mutation(() => ReviewResponse)
  @Auth([Permission.CREATE_REVIEW])
  async createReview(
    @CurrentUser() user: CurrentUserDto,
    @Args('createReviewInput') createReviewInput: CreateReviewInput,
  ): Promise<ReviewResponse> {
    return this.reviewService.createReview(user.id, createReviewInput);
  }

  @Mutation(() => ReviewResponse)
  @Auth([Permission.UPDATE_REVIEW])
  async updateReview(
    @CurrentUser() user: CurrentUserDto,
    @Args('updateReviewInput') updateReviewInput: UpdateReviewInput,
  ): Promise<ReviewResponse> {
    return this.reviewService.updateReview(updateReviewInput, user.id);
  }

  @Mutation(() => ReviewResponse)
  @Auth([Permission.DELETE_REVIEW])
  async deleteReview(
    @CurrentUser() user: CurrentUserDto,
    @Args('id') id: string,
  ): Promise<ReviewResponse> {
    return this.reviewService.deleteReview(id, user.id);
  }

  @Query(() => ReviewResponse)
  async findReviewById(@Args('id') id: string): Promise<ReviewResponse> {
    return this.reviewService.findById(id);
  }

  @Query(() => ReviewsResponse)
  async findReviews(
    @Args('findReviewInput', { nullable: true })
    findReviewInput?: FindReviewInput,
  ): Promise<ReviewsResponse> {
    return this.reviewService.findByAll(findReviewInput);
  }

  // Resolver Fields
  @ResolveField(() => User)
  async student(@Parent() review: Review): Promise<User> {
    return this.reviewLoader.batchStudents.load(review.studentId);
  }

  @ResolveField(() => Course)
  async course(@Parent() review: Review): Promise<Course> {
    return this.reviewLoader.batchCourses.load(review.courseId);
  }
}
