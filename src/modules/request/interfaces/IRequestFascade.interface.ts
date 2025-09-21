import { RequestResponse } from '../dto/requestResponse.dto';
import { CourseIdInput } from 'src/modules/courses/inputs/courseId.input';

export interface IRequestFascade {
  create(
    courseIdInput: CourseIdInput,
    userId: string,
  ): Promise<RequestResponse>;
  accept(requestId: string): Promise<RequestResponse>;
  reject(requestId: string): Promise<RequestResponse>;
  cancel(requestId: string, userId: string): Promise<RequestResponse>;
  delete(requestId: string): Promise<RequestResponse>;
}
