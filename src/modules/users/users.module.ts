import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserService } from './users.service';
import { UserResolver } from './users.resolver';
import { UserFacadeService } from './fascade/user.fascade';
import { User } from './entity/user.entity';
import { UserProxy } from './proxy/user.proxy';
import { Request } from '../request/entity/request.entity';
import { CartProxy } from '../cart/proxy/Cart.proxy';
import { CartItem } from '../cart/entities/cartItem.enitty';
import { Cart } from '../cart/entities/cart.entity';
import { EmailModule, RedisModule, UploadService } from '@bts-soft/core'

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Request, CartItem, Cart]),
    EmailModule,
    RedisModule,
  ],
  providers: [
    UserService,
    UserResolver,
    UserProxy,
    UserFacadeService,
    UploadService,
    CartProxy,
  ],
  exports: [UserService, UserFacadeService, UserProxy, TypeOrmModule],
})
export class UserModule {}
