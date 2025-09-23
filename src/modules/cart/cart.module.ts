import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartService } from './cart.service';
import { CartResolver } from './cart.resolver';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cartItem.enitty';
import { UserModule } from '../users/users.module';
import { CartProxy } from './proxy/Cart.proxy';
import { CartFascade } from './fascade/cart.fascade';
import { DefaultCartPricingStrategy } from './strategy/cart.strategy';
import { CourseModule } from '../courses/course.module';
import { Request } from '../request/entity/request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cart, CartItem, Request]),
    forwardRef(() => UserModule),
    forwardRef(() => CourseModule),
  ],
  providers: [
    CartService,
    CartProxy,
    CartFascade,
    DefaultCartPricingStrategy,
    CartResolver,
  ],
})
export class CartModule {}
