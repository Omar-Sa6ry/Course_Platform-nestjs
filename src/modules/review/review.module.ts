import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entity/review.entity';
import { ReviewService } from './review.service';
import { ReviewResolver } from './review.resolver';
import { ReviewProxy } from './proxy/review.proxy';
import { ReviewFascade } from './fascade/review.fascade';
import { Course } from '../courses/entity/course.entity';
import { User } from '../users/entity/user.entity';
import { ReviewLoaders } from './dataLoader/review.dataLoader';
import { CourseModule } from '../courses/course.module';
import { CertificateModule } from '../certificate/certificate.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Course, User]),
    CertificateModule,
    CourseModule,
  ],
  providers: [
    ReviewService,
    ReviewResolver,
    ReviewProxy,
    ReviewFascade,
    ReviewLoaders,
  ],
})
export class ReviewModule {}
