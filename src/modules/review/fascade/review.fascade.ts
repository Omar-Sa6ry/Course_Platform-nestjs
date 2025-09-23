import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Review } from '../entity/review.entity';
import { ReviewProxy } from '../proxy/review.proxy';
import { CreateReviewInput } from '../inputs/createReview.input';
import { ReviewResponse } from '../dto/reviewResponse.dto';
import { Course } from 'src/modules/courses/entity/course.entity';
import { CertificateProxy } from 'src/modules/certificate/proxy/certificate.proxy';
import { Transactional } from 'typeorm-transactional';
import { UpdateReviewInput } from '../inputs/updateReview.input';
import { CourseProxy } from 'src/modules/courses/proxy/course.proxy';

@Injectable()
export class ReviewFascade {
  constructor(
    private readonly i18n: I18nService,
    private readonly reviewProxy: ReviewProxy,
    private readonly courseProxy: CourseProxy,
    private readonly certificateProxy: CertificateProxy,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  @Transactional()
  async create(
    studentId: string,
    createReviewInput: CreateReviewInput,
  ): Promise<ReviewResponse> {
    const [course] = await Promise.all([
      (await this.courseProxy.findById(createReviewInput.courseId))!.data,
      this.reviewProxy.checkIfExisted(studentId, createReviewInput.courseId),
      this.certificateProxy.checkCertificateExisted(
        studentId,
        createReviewInput.courseId,
      ),
    ]);

    const review = this.reviewRepository.create({
      ...createReviewInput,
      student: { id: studentId },
      course: { id: createReviewInput.courseId },
    });
    await this.reviewRepository.save(review);

    course.ratingCount += 1;
    course.ratingAvg =
      (Number(course.ratingAvg) * (course.ratingCount - 1) +
        createReviewInput.rating) /
      course.ratingCount;
    await this.courseRepository.save(course);

    return {
      statusCode: 201,
      data: review,
      message: this.i18n.t('review.CREATED'),
    };
  }

  @Transactional()
  async update(
    updateReviewInput: UpdateReviewInput,
    studentId: string,
  ): Promise<ReviewResponse> {
    const review = (await this.reviewProxy.findById(updateReviewInput.id))!
      .data;

    if (review.student.id !== studentId)
      throw new NotFoundException(this.i18n.t('review.NOT_FOUND'));

    Object.assign(review, updateReviewInput);

    if (updateReviewInput.rating) {
      const course = (await this.courseProxy.findById(review.course.id))!.data;
      course.ratingAvg =
        (Number(course.ratingAvg) * (course.ratingCount - 1) +
          updateReviewInput.rating) /
        course.ratingCount;
      this.courseRepository.save(course);
    }

    await this.reviewRepository.save(review);

    return {
      data: review,
      message: this.i18n.t('review.UPDATED'),
    };
  }

  @Transactional()
  async delete(id: string, studentId: string): Promise<ReviewResponse> {
    const review = (await this.reviewProxy.findById(id))!.data;
    if (review.student.id !== studentId)
      throw new NotFoundException(this.i18n.t('review.NOT_FOUND'));

    await this.reviewRepository.remove(review);

    const course = (await this.courseProxy.findById(review.course.id))!.data;

    course.ratingCount -= 1;
    course.ratingAvg =
      (Number(course.ratingAvg) * course.ratingCount - review.rating) /
      (course.ratingCount - 1);

    this.courseRepository.save(course);

    return {
      data: review,
      message: this.i18n.t('review.DELETED'),
    };
  }
}
