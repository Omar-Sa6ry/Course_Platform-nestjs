import { UserProxy } from './../../users/proxy/user.proxy';
import { Repository } from 'typeorm';
import {
  RequestCountResponse,
  RequestResponse,
} from '../dto/requestResponse.dto';
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
import { RequestCommand } from '../command/request.command';
import { Course } from 'src/modules/courses/entity/course.entity';
import { CartItem } from 'src/modules/cart/entities/cartItem.enitty';
import { Cart } from 'src/modules/cart/entities/cart.entity';
import { WishlistProxy } from 'src/modules/wishlist/proxy/wishlist.proxy';
import { Certificate } from 'src/modules/certificate/entity/certificate.entity';
import { RedisService, SendEmailService } from '@bts-soft/core';

@Injectable()
export class RequestFascade implements IRequestFascade {
  constructor(
    private readonly i18n: I18nService,
    private readonly emailService: SendEmailService,
    private readonly redisService: RedisService,
    private readonly userProxy: UserProxy,
    private readonly courseProxy: CourseProxy,
    private readonly requestProxy: RequestProxy,
    private readonly wishlistProxy: WishlistProxy,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
    @InjectRepository(Cart)
    private readonly cartRepository: Repository<Cart>,
    @InjectRepository(CartItem)
    private readonly cartItemRepository: Repository<CartItem>,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
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

    const cachedRequest = await this.redisService.get(`request-count`);
    if (cachedRequest)
      this.redisService.set(`request-count`, +cachedRequest + 1);

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

    const course = (await this.courseProxy.findById(request.courseId))?.data;

    request.status = RequestStatus.APPROVED;
    course.studentCount += 1;

    await this.courseRepository.save(course);
    await this.requestRepository.save(request);

    const userRequests = (
      await this.requestProxy.findAll({
        userId: request.userId,
        status: RequestStatus.APPROVED,
      })
    ).pagination.totalItems;

    if (userRequests === 0) await this.userProxy.makeUserActive(request.userId);

    this.checkIfInCart(request.userId, request.courseId);
    this.wishlistProxy.checkIfInWishlist(request.userId, request.courseId);

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

  async profits(): Promise<RequestCountResponse> {
    const requests = await this.requestRepository.find({
      where: { status: RequestStatus.APPROVED },
      relations: ['course'],
    });

    const certificates = await this.certificateRepository.find({
      relations: ['course'],
    });

    const profits: number =
      +requests
        .map((request, index) => request.course.price)
        .reduce((a, b) => a + b, 0) +
      +certificates.reduce((a, b) => a + b.course.price, 0);

    return { data: profits, message: this.i18n.t('request.PROFITS') };
  }

  // private method
  private async checkIfInCart(userId: string, courseId: string) {
    const checkIfInCart = await this.cartItemRepository.findOne({
      where: { cart: { userId: userId }, courseId: courseId },
    });
    if (checkIfInCart) {
      this.cartItemRepository.remove(checkIfInCart);
      const cart = await this.cartRepository.findOne({
        where: { userId: userId },
      });
      cart.totalPrice = cart.totalPrice - checkIfInCart.totalPrice;
      this.cartRepository.save(cart);
    }
  }
}
