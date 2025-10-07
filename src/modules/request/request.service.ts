import { Injectable } from '@nestjs/common';
import { RequestFascade } from './fascade/request.fascade';
import { RequestProxy } from './proxy/request.proxy';
import { Limit, Page } from 'src/common/constant/messages.constant';
import {
  RequestCountResponse,
  RequestResponse,
  RequestsResponse,
} from './dto/requestResponse.dto';
import { CoursesResponse } from '../courses/dto/courseResponse.dto';
import { FindRequestInput } from './inputs/findRequest.input';

@Injectable()
export class RequestService {
  constructor(
    private readonly requestFascade: RequestFascade,
    private readonly requestProxy: RequestProxy,
  ) {}

  async create(courseIdInput, userId): Promise<RequestResponse> {
    return this.requestFascade.create(courseIdInput, userId);
  }

  async accept(requestId): Promise<RequestResponse> {
    return this.requestFascade.accept(requestId);
  }

  async reject(requestId): Promise<RequestResponse> {
    return this.requestFascade.reject(requestId);
  }

  async cancel(requestId, userId): Promise<RequestResponse> {
    return this.requestFascade.cancel(requestId, userId);
  }

  async profits(): Promise<RequestCountResponse> {
    return this.requestFascade.profits();
  }

  async countPendding(): Promise<RequestCountResponse> {
    return this.requestProxy.countPendding();
  }

  async delete(requestId): Promise<RequestResponse> {
    return this.requestFascade.delete(requestId);
  }

  async findById(id): Promise<RequestResponse> {
    return this.requestProxy.findById(id);
  }

  async findAll(
    findRequestInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<RequestsResponse> {
    return this.requestProxy.findAll(findRequestInput, page, limit);
  }

  async findAllWithPagination(
    findRequestInput: FindRequestInput,
  ): Promise<RequestsResponse> {
    return this.requestProxy.findAllWithPagination(findRequestInput);
  }

  async findCoursesByUserId(userId: string): Promise<CoursesResponse> {
    return this.requestProxy.getCoursesForUser(userId);
  }
}
