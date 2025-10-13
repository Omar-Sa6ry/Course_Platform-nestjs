import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Certificate } from './entity/certificate.entity';
import { Course } from '../courses/entity/course.entity';
import { User } from '../users/entity/user.entity';
import { CertificateService } from './certificate.service';
import { CertificateResolver } from './certificate.resolver';
import { CertificateLoader } from './dataLoader/certificate.dataLoader';
import { CertificateProxy } from './proxy/certificate.proxy';
import { CertificateFascade } from './fascade/certificate.fascade';
import { UserModule } from '../users/users.module';
import { CourseProxy } from '../courses/proxy/course.proxy';
import { RequestModule } from '../request/request.module';
import { RedisModule, SendEmailService } from '@bts-soft/core';
import { EmailModule } from '@bts-soft/core';

@Module({
  imports: [
    TypeOrmModule.forFeature([Certificate, Course, User]),
    RequestModule,
    UserModule,
    RedisModule,
    EmailModule,
  ],
  providers: [
    CertificateService,
    CertificateResolver,
    CertificateLoader,
    CertificateProxy,
    CourseProxy,
    CertificateFascade,
    SendEmailService,
  ],
  exports: [TypeOrmModule, CertificateProxy],
})
export class CertificateModule {}
