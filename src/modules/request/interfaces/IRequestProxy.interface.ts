import { RequestResponse, RequestsResponse } from '../dto/requestResponse.dto';
import { FindRequestInput } from '../inputs/findRequest.input';
import { CoursesResponse } from 'src/modules/courses/dto/courseResponse.dto';

export interface IRequestProxy {
  findById(id: string): Promise<RequestResponse>;
  findByIdifPending(id: string): Promise<RequestResponse>;
  findAllWithPagination(
    findRequestInput: FindRequestInput,
  ): Promise<RequestsResponse>;
  findAll(
    findRequestInput: FindRequestInput,
    page?: number,
    limit?: number,
  ): Promise<RequestsResponse>;
  getCoursesForUser(userId: string): Promise<CoursesResponse>;
}
