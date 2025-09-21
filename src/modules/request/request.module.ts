import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Request } from './entity/request.entity';
import { RequestService } from './request.service';
import { RequestFascade } from './fascade/request.fascade';
import { RequestProxy } from './proxy/request.proxy';
import { RequestResolver } from './request.resolver';
import { RequestRelationsLoader } from './dataloaders/request.dataloader';
import { User } from '../users/entity/user.entity';
import { Course } from '../courses/entity/course.entity';
import { UserModule } from '../users/users.module';
import { CourseModule } from '../courses/course.module';
import { CourseLoaderForUser } from './dataloaders/CourseLoaderForUser.dataloader';
import { SendEmailService } from 'src/common/queues/email/sendemail.service';
import { EmailModule } from 'src/common/queues/email/email.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, User, Course]),
    UserModule,
    CourseModule,
    EmailModule,
  ],
  providers: [
    RequestService,
    RequestFascade,
    RequestProxy,
    RequestResolver,
    CourseLoaderForUser,
    RequestRelationsLoader,
    SendEmailService,
  ],
})
export class RequestModule {}
