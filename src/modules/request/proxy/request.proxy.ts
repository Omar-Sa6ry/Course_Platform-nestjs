import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Request } from '../entity/request.entity';
import { RequestResponse, RequestsResponse } from '../dto/requestResponse.dto';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { RequestExistsHandler } from '../chain/request.chain';
import { FindRequestInput } from '../inputs/findRequest.input';
import { RequestStatus } from 'src/common/constant/enum.constant';
import { CourseLoaderForUser } from '../dataloaders/CourseLoaderForUser.dataloader';
import { IRequestProxy } from '../interfaces/IRequestProxy.interface';
import { CoursesResponse } from 'src/modules/courses/dto/courseResponse.dto';
import { request } from 'https';

@Injectable()
export class RequestProxy implements IRequestProxy {
  constructor(
    private readonly i18n: I18nService,
    private readonly courseLoaderForUser: CourseLoaderForUser,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {}

  async findById(id: string): Promise<RequestResponse> {
    const request = await this.requestRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    const existsHandler = new RequestExistsHandler(id);
    await existsHandler.handle(request, this.i18n);

    return { data: request };
  }

  async findByIdifPending(id: string): Promise<RequestResponse> {
    const request = await this.requestRepository.findOne({
      where: { id, status: RequestStatus.PENDING },
      relations: ['user', 'course'],
    });

    const existsHandler = new RequestExistsHandler(id);
    await existsHandler.handle(request, this.i18n);

    return { data: request };
  }

  async findAllWithPagination(
    findRequestInput: FindRequestInput,
  ): Promise<RequestsResponse> {
    const [items, total] = await this.requestRepository.findAndCount({
      where: { ...findRequestInput },
      order: { createdAt: 'DESC' },
    });

    if (items.length === 0)
      throw new NotFoundException(await this.i18n.t('request.NOT_FOUNDS'));

    return {
      items,
    };
  }

  async findAll(
    findRequestInput: FindRequestInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<RequestsResponse> {
    const [items, total] = await this.requestRepository.findAndCount({
      where: { ...findRequestInput },
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    if (items.length === 0)
      throw new NotFoundException(await this.i18n.t('request.NOT_FOUNDS'));

    return {
      items,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getCoursesForUser(userId: string): Promise<CoursesResponse> {
    const requests = await this.requestRepository.find({
      where: { userId, status: RequestStatus.APPROVED },
    });

    if (requests.length === 0) return { items: [] };

    const courses =
      await this.courseLoaderForUser.batchCoursesForUsers.load(userId);

    return { items: courses };
  }
}
