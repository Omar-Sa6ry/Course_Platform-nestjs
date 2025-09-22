import { CourseProxy } from './../../courses/proxy/course.proxy';
import { CreateCertificateInput } from './../inputs/CreateCertificate.input';
import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Certificate } from '../entity/certificate.entity';
import { CertificateResponse } from '../dto/certificateResponse.dto';
import { CertificateProxy } from '../proxy/certificate.proxy';
import { RedisService } from 'src/common/redis/redis.service';
import { Request } from 'src/modules/request/entity/request.entity';
import { RequestStatus } from 'src/common/constant/enum.constant';
import { SendCertificateEmailCommand } from '../command/certificate.command';
import { UserProxy } from 'src/modules/users/proxy/user.proxy';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';

@Injectable()
export class CertificateFascade {
  constructor(
    private readonly i18n: I18nService,
    private readonly emailService: SendEmailService,
    private readonly redisService: RedisService,
    private readonly userProxy: UserProxy,
    private readonly courseProxy: CourseProxy,
    private readonly certificateProxy: CertificateProxy,
    @InjectRepository(Certificate)
    private readonly certificateRepository: Repository<Certificate>,
    @InjectRepository(Request)
    private readonly requestRepository: Repository<Request>,
  ) {}

  @Transactional()
  async create(
    createCertificateInput: CreateCertificateInput,
  ): Promise<CertificateResponse> {
    const { userId, courseId } = createCertificateInput;

    const user = await this.userProxy.findById(userId);
    const course = await this.courseProxy.findById(courseId);

    await this.certificateProxy.checkCertificate(userId, courseId);

    const request = await this.requestRepository.findOne({
      where: {
        user: { id: userId },
        course: { id: courseId },
        status: RequestStatus.APPROVED,
      },
    });

    if (!request)
      throw new BadRequestException(
        await this.i18n.t('certificate.DONOT_OWN_COURSE'),
      );

    const certificate = this.certificateRepository.create({
      course: { id: courseId },
      user: { id: userId },
    });
    await this.certificateRepository.save(certificate);

    this.redisService.set(`certificate:${certificate.id}`, certificate);

    const emailCommand = new SendCertificateEmailCommand(
      this.emailService,
      user.data.email,
      user.data.fullName,
      course.data.title,
    );
    emailCommand.execute();

    return {
      data: certificate,
      message: await this.i18n.t('certificate.CREATED'),
    };
  }

  @Transactional()
  async remove(id: string): Promise<CertificateResponse> {
    const certificate = await (await this.certificateProxy.findById(id))?.data;
    if (!certificate)
      throw new BadRequestException(await this.i18n.t('certificate.NOT_FOUND'));

    await this.certificateRepository.remove(certificate);
    this.redisService.del(`certificate:${id}`);

    return {
      data: null,
      message: await this.i18n.t('certificate.DELETED', { args: { id } }),
    };
  }
}
