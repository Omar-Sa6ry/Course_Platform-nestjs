import { I18nService } from 'nestjs-i18n';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Request } from '../entity/request.entity';
import { IRequestHandler } from '../interfaces/request.interface';

export class RequestExistsHandler implements IRequestHandler {
  private nextHandler: IRequestHandler;

  constructor(private readonly id: string) {}

  setNext(handler: IRequestHandler): IRequestHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(request: Request | null, i18n: I18nService): Promise<void> {
    if (!request) {
      throw new NotFoundException(
        await i18n.t('request.NOT_FOUND', { args: { id: this.id } }),
      );
    }

    if (this.nextHandler) {
      await this.nextHandler.handle(request, i18n);
    }
  }
}

export class RequestUniqueHandler implements IRequestHandler {
  private nextHandler: IRequestHandler;

  constructor(
    private readonly userId: string,
    private readonly courseId: string,
    private readonly repository: Repository<Request>,
  ) {}

  setNext(handler: IRequestHandler): IRequestHandler {
    this.nextHandler = handler;
    return handler;
  }

  async handle(_: Request | null, i18n: I18nService): Promise<void> {
    const existing = await this.repository.findOneBy({
      userId: this.userId,
      courseId: this.courseId,
    });

    if (existing) {
      throw new BadRequestException(
        await i18n.t('request.ALREADY_EXISTS', {
          args: { userId: this.userId, courseId: this.courseId },
        }),
      );
    }

    if (this.nextHandler) {
      await this.nextHandler.handle(null, i18n);
    }
  }
}
