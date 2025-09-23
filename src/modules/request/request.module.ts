import { forwardRef, Module } from '@nestjs/common';
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
import { UserLoader } from './dataloaders/User.dataLoder';
import { EmailQueueService } from './queue/email-queue.service';
import { CartItem } from '../cart/entities/cartItem.enitty';
import { Cart } from '../cart/entities/cart.entity';
import { WishlistProxy } from '../wishlist/proxy/wishlist.proxy';
import { Wishlist } from '../wishlist/entity/wishlist.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Request, Cart, CartItem, Wishlist, User, Course]),
    forwardRef(() => CourseModule),
    UserModule,
    EmailModule,
  ],
  providers: [
    RequestService,
    RequestFascade,
    RequestProxy,
    RequestResolver,
    CourseLoaderForUser,
    EmailQueueService,
    RequestRelationsLoader,
    UserLoader,
    WishlistProxy,
    SendEmailService,
  ],

  exports: [RequestProxy, RequestFascade, TypeOrmModule],
})
export class RequestModule {}
