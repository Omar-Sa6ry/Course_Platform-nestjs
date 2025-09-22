import { RedisService } from './../../../common/redis/redis.service';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Certificate } from '../entity/certificate.entity';
import { I18nService } from 'nestjs-i18n';
import { Limit, Page } from 'src/common/constant/messages.constant';
import { FindCertificateInput } from '../inputs/FindCertificate.input';
import {
  CertificatesResponse,
  CertificateResponse,
} from '../dto/certificateResponse.dto';

@Injectable()
export class CertificateProxy {
  constructor(
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
  ) {}

  async checkCertificate(userId: string, courseId: string): Promise<void> {
    const certificate = await this.certificateRepository.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });

    if (certificate) {
      this.redisService.set(`certificate:${certificate.id}`, certificate);
      throw new NotFoundException(await this.i18n.t('certificate.EXISTED'));
    }
  }

  async findById(id: string): Promise<CertificateResponse> {
    const cacheKey = `certificate:${id}`;
    const cachedCertificate = await this.redisService.get(cacheKey);

    if (cachedCertificate) return { data: cachedCertificate };

    const certificate = await this.certificateRepository.findOne({
      where: { id },
      relations: ['user', 'course'],
    });

    if (!certificate)
      throw new NotFoundException(await this.i18n.t('certificate.NOT_FOUND'));

    this.redisService.set(cacheKey, certificate);

    return { data: certificate };
  }

  async findAll(
    findCertificateInput: FindCertificateInput,
    page: number = Page,
    limit: number = Limit,
  ): Promise<CertificatesResponse> {
    const [certificates, total] = await this.certificateRepository.findAndCount(
      {
        where: {
          ...(findCertificateInput.courseId && {
            course: { id: findCertificateInput.courseId },
          }),
          ...(findCertificateInput.userId && {
            user: { id: findCertificateInput.userId },
          }),
        },
        order: { createdAt: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      },
    );

    if (certificates.length === 0)
      throw new NotFoundException(await this.i18n.t('certificate.NOT_FOUNDS'));

    return {
      items: certificates,
      pagination: {
        totalItems: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
