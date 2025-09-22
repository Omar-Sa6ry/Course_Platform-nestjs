import * as DataLoader from 'dataloader';
import { Injectable, Scope } from '@nestjs/common';
import { Repository, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Certificate } from '../entity/certificate.entity';
import { User } from 'src/modules/users/entity/user.entity';
import { Course } from 'src/modules/courses/entity/course.entity';

@Injectable({ scope: Scope.REQUEST })
export class CertificateLoader {
  constructor(
    @InjectRepository(Certificate)
    private readonly certificateRepo: Repository<Certificate>,

    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  public readonly batchCoursesByCertificate = new DataLoader<string, Course>(
    async (certificateIds: readonly string[]) => {
      const certificates = await this.certificateRepo.find({
        where: { id: In(certificateIds as string[]) },
        relations: ['course'],
      });

      const courseMap = new Map(
        certificates.map((cert) => [cert.id, cert.course]),
      );

      return certificateIds.map((id) => courseMap.get(id));
    },
  );

  public readonly batchUsersByCertificate = new DataLoader<string, User>(
    async (certificateIds: readonly string[]) => {
      const certificates = await this.certificateRepo.find({
        where: { id: In(certificateIds as string[]) },
        relations: ['user'],
      });

      const userMap = new Map(certificates.map((cert) => [cert.id, cert.user]));

      return certificateIds.map((id) => userMap.get(id));
    },
  );
}
