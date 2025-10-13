import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entity/course.entity';
import { CreateCourseInput } from '../inputs/createCourse.input';
import { ICourseStrategy } from '../interfaces/ICourseStratgy.interface';
import { UserProxy } from 'src/modules/users/proxy/user.proxy';
import { CategoryProxy } from 'src/modules/category/proxy/category.proxy';
import { UploadService } from '@bts-soft/core';

@Injectable()
export class CreateCourseStrategy implements ICourseStrategy {
  constructor(
    private readonly uploadService: UploadService,
    private readonly userProxy: UserProxy,
    private readonly categoryProxy: CategoryProxy,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
  ) {}

  async execute(input: CreateCourseInput): Promise<Course> {
    await Promise.all([
      this.categoryProxy.findById(input.categoryId),
      this.userProxy.checkIfInstractor(input.instructorId),
    ]);

    const [imageUrl, promoVideoUrl] = await Promise.all([
      input.image
        ? this.uploadService.uploadImage(input.image, 'courses')
        : Promise.resolve(null),
      input.demo_video
        ? this.uploadService.uploadVideo(input.demo_video, 'courses/videos')
        : Promise.resolve(null),
    ]);

    const course = this.courseRepository.create({
      ...input,
      instructor: { id: input.instructorId },
      category: { id: input.categoryId },
      price: input.price ? Number(input.price) : 0,
      discountPrice:
        input.discountPrice !== undefined ? Number(input.discountPrice) : 0,
      totalHours: input.totalHours ? Number(input.totalHours) : 0,
      totalLectures: input.totalLectures ? Number(input.totalLectures) : 0,
      imageUrl,
      promoVideoUrl,
    });

    return await this.courseRepository.save(course);
  }
}
