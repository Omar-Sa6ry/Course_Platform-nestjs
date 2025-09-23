import { CourseIdInput } from 'src/modules/courses/inputs/courseId.input';
import { WishlistResponse } from '../dto/wishlistResponse.dto';

export interface IWishlistFascade {
  create(
    courseIdInput: CourseIdInput,
    userId: string,
  ): Promise<WishlistResponse>;
  delete(wishlistId: string): Promise<WishlistResponse>;
}
