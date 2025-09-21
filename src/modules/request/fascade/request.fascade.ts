import { UserProxy } from './../../users/proxy/user.proxy';
import { Repository } from 'typeorm';
import { RequestResponse } from '../dto/requestResponse.dto';
import { I18nService } from 'nestjs-i18n';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { CourseProxy } from 'src/modules/courses/proxy/course.proxy';
import { CourseIdInput } from 'src/modules/courses/inputs/courseId.input';
import { Request } from '../entity/request.entity';
import { RequestStatus } from 'src/common/constant/enum.constant';
import { RequestUniqueHandler } from '../chain/request.chain';
import { RequestProxy } from '../proxy/request.proxy';
import { Transactional } from 'typeorm-transactional';
import { IRequestFascade } from '../interfaces/IRequestFascade.interface';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { RequestCommand } from '../command/request.command';

@Injectable()
export class RequestFascade implements IRequestFascade {
  constructor(
    private readonly i18n: I18nService,
    private readonly emailService: SendEmailService,
    private readonly userProxy: UserProxy,
    private readonly courseProxy: CourseProxy,
    private readonly requestProxy: RequestProxy,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {}

  @Transactional()
  async create(
    courseIdInput: CourseIdInput,
    userId: string,
  ): Promise<RequestResponse> {
    const existsHandler = new RequestUniqueHandler(
      userId,
      courseIdInput.courseId,
      this.requestRepository,
    );

    await Promise.all([
      this.userProxy.findById(userId),
      this.courseProxy.findById(courseIdInput.courseId),
      existsHandler.handle(null, this.i18n),
    ]);

    const request = this.requestRepository.create({
      userId,
      courseId: courseIdInput.courseId,
    });
    await this.requestRepository.save(request);

    return {
      message: this.i18n.t('request.CREATED'),
      data: request,
    };
  }

  @Transactional()
  async accept(requestId: string): Promise<RequestResponse> {
    const request = (await this.requestProxy.findByIdifPending(requestId))
      ?.data;

    if (request.course.isActive === false)
      throw new Error(this.i18n.t('course.INACTIVE_COURSE'));

    request.status = RequestStatus.APPROVED;
    await this.requestRepository.save(request);

    const userRequests = (
      await this.requestProxy.findAll({
        userId: request.userId,
        status: RequestStatus.APPROVED,
      })
    ).pagination.totalItems;

    if (userRequests === 0) await this.userProxy.makeUserActive(request.userId);

    const emailCommand = new RequestCommand(
      this.emailService,
      request.user.email,
      this.i18n.t('request.ACCEPTED'),
      this.i18n.t('request.ACCEPTED'),
    );
    emailCommand.execute();

    return {
      message: this.i18n.t('request.ACCEPTED'),
      data: request,
    };
  }

  @Transactional()
  async reject(requestId: string): Promise<RequestResponse> {
    const request = (await this.requestProxy.findByIdifPending(requestId))
      ?.data;

    request.status = RequestStatus.REJECTED;
    await this.requestRepository.save(request);

    const emailCommand = new RequestCommand(
      this.emailService,
      request.user.email,
      this.i18n.t('request.REJECTED'),
      this.i18n.t('request.REJECTED'),
    );
    emailCommand.execute();

    return {
      message: this.i18n.t('request.REJECTED'),
      data: request,
    };
  }

  @Transactional()
  async cancel(requestId: string, userId: string): Promise<RequestResponse> {
    const request = (await this.requestProxy.findByIdifPending(requestId))
      ?.data;

    if (request.userId !== userId)
      throw new Error(this.i18n.t('request.NOT_YOUR_REQUEST'));

    request.status = RequestStatus.CANCELED;
    await this.requestRepository.save(request);

    const emailCommand = new RequestCommand(
      this.emailService,
      request.user.email,
      this.i18n.t('request.CANCELED'),
      this.i18n.t('request.CANCELED'),
    );
    emailCommand.execute();

    return {
      message: this.i18n.t('request.CANCELED'),
      data: request,
    };
  }

  @Transactional()
  async delete(requestId: string): Promise<RequestResponse> {
    const request = (await this.requestProxy.findById(requestId))?.data;

    if (request.status === RequestStatus.APPROVED)
      throw new Error(this.i18n.t('request.CANNOT_DELETE_APPROVED'));

    await this.requestRepository.remove(request);
    return {
      message: this.i18n.t('request.DELETED'),
      data: request,
    };
  }
}
